"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIES = {
  expense: ["餐飲", "交通", "購物", "娛樂", "醫療", "教育", "居家", "其他"],
  income: ["薪資", "獎金", "投資", "其他"],
};

const emptyForm = { type: "expense", amount: "", category: CATEGORIES.expense[0], note: "", date: "" };

export default function Home() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

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
      loadTransactions();
    }
  }, [session]);

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("讀取記帳紀錄失敗");
      setTransactions(await res.json());
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
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          category: form.category,
          note: form.note || undefined,
          date: form.date || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "新增失敗");
      }
      setForm(emptyForm);
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(tx) {
    setEditingId(tx._id);
    setEditForm({
      type: tx.type,
      amount: String(tx.amount),
      category: tx.category,
      note: tx.note || "",
      date: tx.date ? tx.date.slice(0, 10) : "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdate(id) {
    setError("");
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editForm.type,
          amount: Number(editForm.amount),
          category: editForm.category,
          note: editForm.note || undefined,
          date: editForm.date || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "更新失敗");
      }
      cancelEdit();
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "刪除失敗");
      }
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <p className="text-sm text-zinc-500">載入中...</p>
        </main>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">記帳紀錄管理</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            請先{" "}
            <Link href="/login" className="text-zinc-900 underline dark:text-zinc-50">
              登入
            </Link>{" "}
            才能查看與新增記帳紀錄。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">記帳紀錄管理</h1>
        <p className="text-sm text-zinc-500">目前登入：{session.name}（{session.email}）</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">新增記帳紀錄</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, category: CATEGORIES[e.target.value][0] })}
            >
              <option value="expense">支出</option>
              <option value="income">收入</option>
            </select>
            <input
              type="number"
              placeholder="金額"
              required
              min="0"
              className="w-32 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className="w-32 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="備註（選填）"
              className="w-40 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <input
              type="date"
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <button
              type="submit"
              className="rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-50 dark:text-zinc-900"
            >
              新增
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">記帳紀錄列表</h2>
          {loading && <p className="text-sm text-zinc-500">載入中...</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-zinc-500">目前沒有記帳紀錄</p>
          )}
          <ul className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <li
                key={tx._id}
                className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {editingId === tx._id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <select
                      className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      value={editForm.type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, type: e.target.value, category: CATEGORIES[e.target.value][0] })
                      }
                    >
                      <option value="expense">支出</option>
                      <option value="income">收入</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    />
                    <select
                      className="w-28 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      {CATEGORIES[editForm.type].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="w-32 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    />
                    <input
                      type="date"
                      className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(tx._id)}
                        className="rounded bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900"
                      >
                        儲存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-zinc-900 dark:text-zinc-50">
                      <span className={tx.type === "income" ? "text-green-600" : "text-red-600"}>
                        {tx.type === "income" ? "收入" : "支出"}
                      </span>{" "}
                      ${tx.amount} · {tx.category}
                      {tx.note && <span className="text-zinc-500"> · {tx.note}</span>}
                      <span className="ml-2 text-xs text-zinc-400">
                        {tx.date?.slice(0, 10)}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(tx)}
                        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 dark:border-red-800"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
