"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const fieldClass =
  "rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";
const primaryButtonClass =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover";
const dangerButtonClass =
  "rounded-lg border border-danger-line px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10";

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setSession(null);
        return;
      }
      const data = await res.json();
      setSession(data.user);
    } catch {
      setSession(null);
    }
  }

  useEffect(() => {
    if (session) {
      loadProjects();
    }
  }, [session]);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("讀取專案清單失敗");
      setProjects(await res.json());
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
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "新增專案失敗");
      }
      setName("");
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "刪除專案失敗");
      }
      loadProjects();
    } catch (err) {
      setError(err.message);
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
          <h1 className="text-2xl font-semibold tracking-tight text-ink">記帳專案</h1>
          <p className="text-sm text-ink-soft">
            請先{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              登入
            </Link>{" "}
            才能查看與新增記帳專案。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">記帳專案</h1>
          <p className="text-sm text-muted">
            目前登入：{session.name}（{session.email}）
          </p>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">新增專案</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="例如：旅遊基金、家用開銷"
              required
              className={`flex-1 ${fieldClass}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className={primaryButtonClass}>
              建立專案
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">我的專案</h2>
          {loading && <p className="text-sm text-muted">載入中...</p>}
          {!loading && projects.length === 0 && (
            <p className="text-sm text-muted">還沒有任何專案，建立一個開始記帳吧。</p>
          )}
          <ul className="flex flex-col gap-2">
            {projects.map((p) => (
              <li key={p._id} className="rounded-xl border border-line bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/projects/${p._id}`} className="flex-1">
                    <p className="font-medium text-ink hover:text-accent">{p.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      收入 <span className="text-success">${p.income}</span> · 支出{" "}
                      <span className="text-danger">${p.expense}</span> · 結餘{" "}
                      <span className="text-ink-soft">${p.balance}</span>
                    </p>
                  </Link>
                  <button onClick={() => handleDelete(p._id)} className={dangerButtonClass}>
                    刪除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
