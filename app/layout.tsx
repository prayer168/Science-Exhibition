import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "黑熊老師科展日誌",
  description: "記錄科展研究的每一步：日期、研究內容、遇到的問題與待辦事項。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="bg-[var(--bear-brown)] text-white">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🐻</span>
              <span className="text-xl font-black tracking-wide">黑熊老師科展日誌</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link href="/" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">
                日誌牆
              </Link>
              <Link href="/admin" className="px-3 py-2 rounded-lg bg-[var(--accent)] hover:bg-[#d4631f] transition">
                管理後台
              </Link>
              {session?.user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                  className="flex items-center gap-2 ml-2 pl-3 border-l border-white/20"
                >
                  <span className="text-white/70 hidden sm:inline">{session.user.email}</span>
                  <button type="submit" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">
                    登出
                  </button>
                </form>
              ) : (
                <form
                  action={async () => {
                    "use server";
                    await signIn("google", { redirectTo: "/admin" });
                  }}
                >
                  <button type="submit" className="px-3 py-2 rounded-lg hover:bg-white/10 transition">
                    登入
                  </button>
                </form>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
        <footer className="text-center text-sm text-[var(--muted)] py-6 border-t border-[var(--border)] space-y-1">
          <p>🐻 黑熊老師科展日誌 · 記錄研究的每一步</p>
          <p>開發者：陳賢宗（黑熊老師）</p>
          <p>© {new Date().getFullYear()} 陳賢宗（黑熊老師）．版權所有 All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
