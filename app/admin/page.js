"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setSession(data.user))
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (session?.role === "admin") {
      loadUsers();
      loadTransactions();
      loadPosts();
    }
  }, [session]);

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("讀取使用者清單失敗");
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadTransactions() {
    try {
      const res = await fetch("/api/admin/transactions");
      if (!res.ok) throw new Error("讀取記帳紀錄失敗");
      setTransactions(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadPosts() {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("讀取留言板失敗");
      setPosts(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRoleChange(id, role) {
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "更新角色失敗");
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "刪除使用者失敗");
      loadUsers();
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteTransaction(id) {
    setError("");
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "刪除記帳紀錄失敗");
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeletePost(id) {
    setError("");
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "刪除文章失敗");
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-page px-4 py-10">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <p className="text-sm text-muted">載入中...</p>
        </main>
      </div>
    );
  }

  if (session?.role !== "admin") {
    return (
      <div className="min-h-screen bg-page px-4 py-10">
        <main className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">後台管理</h1>
          <p className="text-sm text-ink-soft">
            沒有權限查看此頁面。{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              登入
            </Link>{" "}
            管理員帳號後再試一次。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">後台管理</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">使用者（{users.length}）</h2>
          <ul className="flex flex-col gap-2">
            {users.map((u) => (
              <li
                key={u._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-2 text-sm"
              >
                <div className="text-ink">
                  {u.name} ({u.email})
                  <span className="ml-2 rounded-full bg-page px-2 py-0.5 text-xs text-ink-soft">
                    {u.role}
                  </span>
                </div>
                {u._id === session.userId ? (
                  <span className="text-xs text-muted">（自己）</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleChange(u._id, u.role === "admin" ? "user" : "admin")}
                      className="rounded-lg border border-line px-3 py-1 text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      {u.role === "admin" ? "降為一般使用者" : "升為管理者"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
                    >
                      刪除
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">記帳紀錄（{transactions.length}）</h2>
          <ul className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <li
                key={tx._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-2 text-sm"
              >
                <div className="text-ink">
                  <span className="text-muted">
                    {tx.user?.name ?? "（已刪除使用者）"} · {tx.project?.name ?? "（已刪除專案）"} ·
                  </span>{" "}
                  <span className={tx.type === "income" ? "text-success" : "text-danger"}>
                    {tx.type === "income" ? "收入" : "支出"}
                  </span>{" "}
                  ${tx.amount} · {tx.category}
                  {tx.note && <span className="text-muted"> · {tx.note}</span>}
                  <span className="ml-2 text-xs text-muted">{tx.date?.slice(0, 10)}</span>
                </div>
                <button
                  onClick={() => handleDeleteTransaction(tx._id)}
                  className="rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">留言板文章（{posts.length}）</h2>
          <ul className="flex flex-col gap-2">
            {posts.map((post) => (
              <li
                key={post._id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-line p-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">
                    {post.user?.name ?? "匿名"}
                    <span className="ml-2 text-xs font-normal text-muted">
                      {post.createdAt?.slice(0, 10)}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-ink-soft">{post.content}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="shrink-0 rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
