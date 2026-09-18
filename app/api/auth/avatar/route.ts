import { put, del } from "@vercel/blob";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "請先登入" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "請選擇一個檔案" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "只能上傳圖片檔" }, { status: 400 });
    }

    await dbConnect();

    const previousUser = await User.findById(session.userId).select("avatarUrl");

    const blob = await put(`avatars/${session.userId}-${Date.now()}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await User.findByIdAndUpdate(session.userId, { avatarUrl: blob.url });

    if (previousUser?.avatarUrl) {
      try {
        await del(previousUser.avatarUrl);
      } catch {
        // best-effort cleanup; the new avatar is already saved either way
      }
    }

    return Response.json({ avatarUrl: blob.url }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
