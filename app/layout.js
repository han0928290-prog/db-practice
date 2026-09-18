import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { getSession } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "記帳紀錄管理",
  description: "記帳、留言板與會員管理",
};

const navLinkClass =
  "text-sm font-medium text-ink-soft transition-colors hover:text-accent";

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page text-ink">
        <nav className="sticky top-0 z-10 flex items-center gap-6 border-b border-line bg-card/90 px-6 py-4 backdrop-blur">
          <span className="text-sm font-semibold tracking-wide text-ink">
            Hank的記帳本
          </span>
          <div className="flex flex-1 gap-5">
            <Link href="/" className={navLinkClass}>
              記帳專案
            </Link>
            <Link href="/board" className={navLinkClass}>
              留言板
            </Link>
            <Link href="/login" className={navLinkClass}>
              會員中心
            </Link>
            {session?.role === "admin" && (
              <Link href="/admin" className={navLinkClass}>
                後台管理
              </Link>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
