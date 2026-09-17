import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "無權限" }, { status: 403 });
  }

  try {
    await dbConnect();
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    return Response.json(users);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
