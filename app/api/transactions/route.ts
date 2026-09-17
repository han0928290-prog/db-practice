import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    await dbConnect();
    const transactions = await Transaction.find({ user: session.userId }).sort({ date: -1 });
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

    const body = await request.json();
    const { type, amount, category, note, date } = body;

    const transaction = await Transaction.create({
      user: session.userId,
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
