import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import { getSession } from "@/lib/session";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/posts/[id]">) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await dbConnect();
    const session = await getSession();

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    const isOwner = post.user && post.user.toString() === session?.userId;
    const isAdmin = session?.role === "admin";
    if (post.user && !isOwner && !isAdmin) {
      return Response.json({ error: "只能刪除自己的文章" }, { status: 403 });
    }

    await post.deleteOne();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
