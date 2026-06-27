"use client";

import { useEffect, useRef } from "react";

export default function AutoSignIn({ action }: { action: () => Promise<void> }) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // 進入頁面後立即觸發 Google 登入流程
    ref.current?.requestSubmit();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="text-5xl mb-4">🐻🔑</div>
      <p className="text-[var(--muted)] mb-6">正在前往 Google 登入…</p>
      <form ref={ref} action={action}>
        <button type="submit" className="btn-primary inline-block">
          若沒有自動跳轉，請點此用 Google 登入
        </button>
      </form>
    </div>
  );
}
