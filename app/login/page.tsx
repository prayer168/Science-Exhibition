import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import AutoSignIn from "./AutoSignIn";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const session = await auth();
  if (session?.user) redirect(callbackUrl || "/admin");

  async function startSignIn() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl || "/admin" });
  }

  // 若被拒絕（帳號不在允許清單），顯示錯誤訊息，不要自動再次嘗試（避免無限循環）
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bear-card p-8 text-center">
          <div className="text-5xl mb-3">🐻🚫</div>
          <h1 className="text-xl font-black mb-2">無法登入</h1>
          <p className="text-[var(--muted)] text-sm mb-6">
            {error === "AccessDenied"
              ? "此 Google 帳號沒有後台權限，請聯絡管理員加入允許清單。"
              : "登入失敗，請再試一次。"}
          </p>
          <form action={startSignIn}>
            <button type="submit" className="btn-primary inline-block">
              用其他 Google 帳號登入
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AutoSignIn action={startSignIn} />;
}
