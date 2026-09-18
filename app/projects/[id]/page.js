"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import PieChart from "@/app/components/PieChart";
import { CATEGORIES, EXPENSE_CATEGORY_COLORS } from "@/lib/categories";

const emptyForm = { type: "expense", amount: "", category: CATEGORIES.expense[0], note: "", date: "" };

const fieldClass =
  "rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";
const primaryButtonClass =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover";
const ghostButtonClass =
  "rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent hover:text-accent";
const dangerButtonClass =
  "rounded-lg border border-danger-line px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10";

export default function ProjectDetail({ params }) {
  const { id } = use(params);

  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [project, setProject] = useState(undefined); // undefined = loading, null = not found/forbidden
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
      loadProject();
      loadTransactions();
    }
  }, [session]);

  async function loadProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        setProject(null);
        return;
      }
      setProject(await res.json());
    } catch {
      setProject(null);
    }
  }

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/transactions?projectId=${id}`);
      if (!res.ok) throw new Error("讀取記帳紀錄失敗");
      setTransactions(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const totals = new Map();
    for (const tx of transactions) {
      if (tx.type !== "expense") continue;
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
    return CATEGORIES.expense
      .map((category) => ({
        label: category,
        value: totals.get(category) ?? 0,
        color: EXPENSE_CATEGORY_COLORS[category],
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
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

  async function handleUpdate(txId) {
    setError("");
    try {
      const res = await fetch(`/api/transactions/${txId}`, {
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

  async function handleDelete(txId) {
    setError("");
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "刪除失敗");
      }
      loadTransactions();
    } catch (err) {
      setError(err.message);
    }
  }

  if (session === undefined || (session && project === undefined)) {
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
            才能查看記帳專案。
          </p>
        </main>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-page px-4 py-10">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">找不到專案</h1>
          <p className="text-sm text-ink-soft">
            這個專案不存在，或不屬於你。{" "}
            <Link href="/" className="font-medium text-accent hover:text-accent-hover">
              回到專案列表
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-sm text-muted hover:text-accent">
            ← 所有專案
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{project.name}</h1>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <p className="text-xs text-muted">收入</p>
            <p className="mt-1 text-lg font-semibold text-success">${summary.income}</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <p className="text-xs text-muted">支出</p>
            <p className="mt-1 text-lg font-semibold text-danger">${summary.expense}</p>
          </div>
          <div className="rounded-xl border border-line bg-card p-4 shadow-sm">
            <p className="text-xs text-muted">結餘</p>
            <p className="mt-1 text-lg font-semibold text-ink">${summary.balance}</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">支出分類比例</h2>
          <PieChart
            data={expenseByCategory}
            centerLabel="總支出"
            centerValue={`$${summary.expense}`}
          />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">新增記帳紀錄</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              className={fieldClass}
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
              className={`w-32 ${fieldClass}`}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className={`w-32 ${fieldClass}`}
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
              className={`w-40 ${fieldClass}`}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
            <input
              type="date"
              className={fieldClass}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <button type="submit" className={primaryButtonClass}>
              新增
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">記帳紀錄列表</h2>
          {loading && <p className="text-sm text-muted">載入中...</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-muted">目前沒有記帳紀錄</p>
          )}
          <ul className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <li key={tx._id} className="rounded-xl border border-line bg-card p-3 shadow-sm">
                {editingId === tx._id ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <select
                      className={fieldClass}
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
                      className={`w-28 ${fieldClass}`}
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    />
                    <select
                      className={`w-28 ${fieldClass}`}
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
                      className={`w-32 ${fieldClass}`}
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    />
                    <input
                      type="date"
                      className={fieldClass}
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(tx._id)} className={primaryButtonClass}>
                        儲存
                      </button>
                      <button onClick={cancelEdit} className={ghostButtonClass}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm text-ink">
                      <span className={tx.type === "income" ? "text-success" : "text-danger"}>
                        {tx.type === "income" ? "收入" : "支出"}
                      </span>{" "}
                      ${tx.amount} · {tx.category}
                      {tx.note && <span className="text-muted"> · {tx.note}</span>}
                      <span className="ml-2 text-xs text-muted">{tx.date?.slice(0, 10)}</span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => startEdit(tx)} className={ghostButtonClass}>
                        編輯
                      </button>
                      <button onClick={() => handleDelete(tx._id)} className={dangerButtonClass}>
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
