"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UploadPage() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setSession(data.user))
      .catch(() => setSession(null));
  }, []);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : "");
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "上傳失敗");
      setUploaded((prev) => [{ url: data.url, name: file.name }, ...prev]);
      setFile(null);
      setPreviewUrl("");
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-page px-4 py-10">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <p className="text-sm text-muted">載入中...</p>
        </main>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="min-h-screen bg-page px-4 py-10">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">上傳圖片</h1>
          <p className="text-sm text-ink-soft">
            請先{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              登入
            </Link>{" "}
            才能上傳圖片。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">上傳圖片</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-on-accent hover:file:bg-accent-hover"
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="預覽"
                className="max-h-64 w-fit rounded-lg border border-line object-contain"
              />
            )}
            <button
              type="submit"
              disabled={!file || uploading}
              className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {uploading ? "上傳中..." : "上傳到 Vercel Blob"}
            </button>
          </form>
        </section>

        {uploaded.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">本次已上傳</h2>
            <ul className="flex flex-col gap-2">
              {uploaded.map((item) => (
                <li key={item.url} className="rounded-xl border border-line bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm text-ink">{item.name}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs text-accent hover:text-accent-hover"
                      >
                        {item.url}
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
