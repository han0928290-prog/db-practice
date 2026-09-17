import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    await dbConnect();
    void User; // ensure User model is registered before populate

    const posts = await Post.find().populate("user", "name email").sort({ createdAt: -1 });
    return Response.json(posts);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await getSession();

    const { content } = await request.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return Response.json({ error: "content 為必填" }, { status: 400 });
    }

    const post = await Post.create({ user: session?.userId, content });
    await post.populate("user", "name email");

    return Response.json(post, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
