import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/transactions/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "無權限" }, { status: 403 });
  }

  try {
    await dbConnect();
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
