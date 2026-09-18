import { put } from "@vercel/blob";
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

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return Response.json({ url: blob.url, pathname: blob.pathname }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
