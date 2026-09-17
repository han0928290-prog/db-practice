import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { createSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: "email, password 皆為必填" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return Response.json({ error: "email 或密碼錯誤" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: "email 或密碼錯誤" }, { status: 401 });
    }

    await createSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return Response.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
