import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { createSessionCookie } from "@/lib/session";
import { roleForEmail } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return Response.json({ error: "name, email, password 皆為必填" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return Response.json({ error: "密碼長度至少 6 碼" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = roleForEmail(email);
    const user = await User.create({ name, email, passwordHash, role });

    await createSessionCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return Response.json(
      { _id: user._id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return Response.json({ error: "此 email 已被使用" }, { status: 409 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
