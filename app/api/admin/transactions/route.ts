import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Project from "@/models/Project";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "無權限" }, { status: 403 });
  }

  try {
    await dbConnect();
    void User; // ensure User model is registered before populate
    void Project; // ensure Project model is registered before populate
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .populate("project", "name")
      .sort({ date: -1 });
    return Response.json(transactions);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
