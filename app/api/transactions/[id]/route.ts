import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/transactions/[id]">) {
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
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (transaction.user.toString() !== session.userId) {
      return Response.json({ error: "只能存取自己的紀錄" }, { status: 403 });
    }
    return Response.json(transaction);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/transactions/[id]">) {
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

    const existing = await Transaction.findById(id);
    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (existing.user.toString() !== session.userId) {
      return Response.json({ error: "只能編輯自己的紀錄" }, { status: 403 });
    }

    const { type, amount, category, note, date } = await req.json();
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { type, amount, category, note, date },
      { new: true, runValidators: true }
    );
    return Response.json(transaction);
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

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/transactions/[id]">) {
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
    const existing = await Transaction.findById(id);
    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }
    if (existing.user.toString() !== session.userId) {
      return Response.json({ error: "只能刪除自己的紀錄" }, { status: 403 });
    }

    await existing.deleteOne();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
