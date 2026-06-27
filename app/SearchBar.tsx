"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ basePath }: { basePath: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function reset() {
    setQ("");
    setFrom("");
    setTo("");
    router.push(basePath);
  }

  const hasFilter = sp.get("q") || sp.get("from") || sp.get("to");

  return (
    <form onSubmit={submit} className="bear-card p-4 mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="field-label">關鍵字</label>
          <input
            className="field-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋研究內容、問題、待辦、地點、記錄者…"
          />
        </div>
        <div>
          <label className="field-label">起始日期</label>
          <input type="date" className="field-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="field-label">結束日期</label>
          <input type="date" className="field-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            🔍 查詢
          </button>
          {hasFilter && (
            <button type="button" className="btn-ghost" onClick={reset} suppressHydrationWarning>
              清除
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
