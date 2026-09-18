import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }

  try {
    await dbConnect();
    const user = await User.findById(session.userId).select("avatarUrl");
    return Response.json({ user: { ...session, avatarUrl: user?.avatarUrl ?? null } });
  } catch {
    return Response.json({ user: session });
  }
}
