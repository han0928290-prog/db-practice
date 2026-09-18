"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const emptyRegisterForm = { name: "", email: "", password: "" };
const emptyLoginForm = { email: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "註冊失敗");
      setRegisterForm(emptyRegisterForm);
      loadSession();
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "登入失敗");
      setLoginForm(emptyLoginForm);
      loadSession();
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/auth/avatar", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "上傳大頭照失敗");
      setSession((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleLogout() {
    setError("");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-page px-4 py-10">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">會員中心</h1>

        {error && <p className="text-sm text-danger">{error}</p>}

        {session === undefined && <p className="text-sm text-muted">載入中...</p>}

        {session === null && (
          <section className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "login"
                    ? "bg-accent text-on-accent"
                    : "border border-line text-ink-soft hover:border-accent hover:text-accent"
                }`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "register"
                    ? "bg-accent text-on-accent"
                    : "border border-line text-ink-soft hover:border-accent hover:text-accent"
                }`}
              >
                註冊
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="email"
                  required
                  className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="密碼"
                  required
                  className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
                >
                  登入
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="姓名"
                  required
                  className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="email"
                  required
                  className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="密碼（至少 6 碼）"
                  required
                  className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
                >
                  註冊
                </button>
              </form>
            )}
          </section>
        )}

        {session && (
          <section className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {session.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.avatarUrl}
                  alt={session.name}
                  className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-line bg-page text-lg font-semibold text-muted">
                  {session.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">{session.name}</span>（{session.email}）
                </p>
                <label className="w-fit cursor-pointer text-sm font-medium text-accent hover:text-accent-hover">
                  {uploadingAvatar ? "上傳中..." : "更換大頭照"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="self-start rounded-lg border border-danger-line px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              登出
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
