"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Board() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setSession(data.user))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("讀取留言板失敗");
      setPosts(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "發文失敗");
      }
      setContent("");
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "刪除失敗");
      }
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">留言板</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">發表文章</h2>
          <p className="text-sm text-zinc-500">
            {session ? (
              <>以 <span className="font-medium text-zinc-700 dark:text-zinc-300">{session.name}</span> 的身份發文</>
            ) : (
              <>
                將以匿名身份發文，{" "}
                <Link href="/login" className="text-zinc-900 underline dark:text-zinc-50">
                  登入
                </Link>{" "}
                後可用帳號發文
              </>
            )}
          </p>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <textarea
              placeholder="寫點什麼..."
              required
              rows={3}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              className="self-start rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              發表
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">所有文章</h2>
          {loading && <p className="text-sm text-zinc-500">載入中...</p>}
          {!loading && posts.length === 0 && <p className="text-sm text-zinc-500">目前沒有文章</p>}
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li
                key={post._id}
                className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {post.user?.name ?? "匿名"}
                      <span className="ml-2 text-xs font-normal text-zinc-400">
                        {post.createdAt?.slice(0, 10)}
                      </span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                      {post.content}
                    </p>
                  </div>
                  {(!post.user || post.user._id === session?.userId) && (
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="shrink-0 rounded border border-red-300 px-3 py-1 text-sm text-red-600 dark:border-red-800"
                    >
                      刪除
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
