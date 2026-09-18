import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Project from "@/models/Project";
import { getSession } from "@/lib/session";

async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found", status: 404 } as const;
  if (project.user.toString() !== userId) return { error: "只能存取自己的專案", status: 403 } as const;
  return null;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    return Response.json({ error: "Invalid or missing projectId" }, { status: 400 });
  }

  try {
    await dbConnect();

    const ownershipError = await assertProjectOwnership(projectId, session.userId);
    if (ownershipError) {
      return Response.json({ error: ownershipError.error }, { status: ownershipError.status });
    }

    const transactions = await Transaction.find({ project: projectId }).sort({ date: -1 });
    return Response.json(transactions);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { projectId, type, amount, category, note, date } = await request.json();
    if (!projectId || !mongoose.isValidObjectId(projectId)) {
      return Response.json({ error: "Invalid or missing projectId" }, { status: 400 });
    }

    const ownershipError = await assertProjectOwnership(projectId, session.userId);
    if (ownershipError) {
      return Response.json({ error: ownershipError.error }, { status: ownershipError.status });
    }

    const transaction = await Transaction.create({
      user: session.userId,
      project: projectId,
      type,
      amount,
      category,
      note,
      date,
    });
    return Response.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
