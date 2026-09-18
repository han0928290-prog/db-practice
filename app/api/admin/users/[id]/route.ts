import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Project from "@/models/Project";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/users/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "無權限" }, { status: 403 });
  }

  const { role } = await req.json();
  if (role !== "admin" && role !== "user") {
    return Response.json({ error: "role 必須是 admin 或 user" }, { status: 400 });
  }
  if (id === admin.userId) {
    return Response.json({ error: "不能調整自己的角色" }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select(
      "name email role createdAt"
    );
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json(user);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/users/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "無權限" }, { status: 403 });
  }
  if (id === admin.userId) {
    return Response.json({ error: "不能刪除自己的帳號" }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    await Transaction.deleteMany({ user: id });
    await Project.deleteMany({ user: id });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
