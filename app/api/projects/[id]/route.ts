import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import Project from "@/models/Project";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.user.toString() !== session.userId) {
      return Response.json({ error: "只能存取自己的專案" }, { status: 403 });
    }

    return Response.json({ _id: project._id, name: project.name, createdAt: project.createdAt });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { name } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "專案名稱為必填" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.user.toString() !== session.userId) {
      return Response.json({ error: "只能編輯自己的專案" }, { status: 403 });
    }

    project.name = name.trim();
    await project.save();

    return Response.json({ _id: project._id, name: project.name, createdAt: project.createdAt });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.user.toString() !== session.userId) {
      return Response.json({ error: "只能刪除自己的專案" }, { status: 403 });
    }

    await project.deleteOne();
    await Transaction.deleteMany({ project: id });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
