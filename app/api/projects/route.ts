import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Project from "@/models/Project";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();

    const projects = await Project.find({ user: session.userId }).sort({ createdAt: -1 });

    const totals = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(session.userId) } },
      { $group: { _id: { project: "$project", type: "$type" }, sum: { $sum: "$amount" } } },
    ]);

    const totalsByProject = new Map();
    for (const row of totals) {
      const key = row._id.project.toString();
      const entry = totalsByProject.get(key) ?? { income: 0, expense: 0 };
      entry[row._id.type] = row.sum;
      totalsByProject.set(key, entry);
    }

    const result = projects.map((p) => {
      const entry = totalsByProject.get(p._id.toString()) ?? { income: 0, expense: 0 };
      return {
        _id: p._id,
        name: p.name,
        createdAt: p.createdAt,
        income: entry.income,
        expense: entry.expense,
        balance: entry.income - entry.expense,
      };
    });

    return Response.json(result);
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

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "專案名稱為必填" }, { status: 400 });
    }

    const project = await Project.create({ user: session.userId, name: name.trim() });
    return Response.json(
      { _id: project._id, name: project.name, createdAt: project.createdAt, income: 0, expense: 0, balance: 0 },
      { status: 201 }
    );
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
