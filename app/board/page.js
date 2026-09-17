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
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">留言板</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">發表文章</h2>
          <p className="text-sm text-muted">
            {session ? (
              <>
                以 <span className="font-medium text-ink-soft">{session.name}</span> 的身份發文
              </>
            ) : (
              <>
                將以匿名身份發文，{" "}
                <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
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
              className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
            >
              發表
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">所有文章</h2>
          {loading && <p className="text-sm text-muted">載入中...</p>}
          {!loading && posts.length === 0 && <p className="text-sm text-muted">目前沒有文章</p>}
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li key={post._id} className="rounded-xl border border-line bg-card p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {post.user?.name ?? "匿名"}
                      <span className="ml-2 text-xs font-normal text-muted">
                        {post.createdAt?.slice(0, 10)}
                      </span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{post.content}</p>
                  </div>
                  {(!post.user || post.user._id === session?.userId) && (
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="shrink-0 rounded-lg border border-danger-line px-3 py-1 text-sm text-danger transition-colors hover:bg-danger/10"
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
