"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  label: string;
  id?: number;
  query?: string;
  compact?: boolean;
};

const FORMATS = [
  { key: "docx", label: "📄 Word（.docx）" },
  { key: "pdf", label: "📕 PDF（.pdf）" },
  { key: "html", label: "🌐 HTML（.html）" },
];

export default function ExportMenu({ label, id, query, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function buildUrl(format: string) {
    const params = new URLSearchParams(query ?? "");
    params.set("format", format);
    if (id != null) params.set("id", String(id));
    return `/api/export?${params.toString()}`;
  }

  async function download(format: string) {
    setBusy(format);
    try {
      const res = await fetch(buildUrl(format));
      if (!res.ok) {
        alert("匯出失敗，請再試一次。");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
      const name = match ? decodeURIComponent(match[1]) : `export.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          compact
            ? "text-sm font-semibold text-[var(--green)] hover:underline"
            : "btn-ghost"
        }
      >
        {label} ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bear-card p-1 z-20 shadow-lg">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              type="button"
              disabled={busy !== null}
              onClick={() => download(f.key)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[var(--accent-light)] disabled:opacity-50"
            >
              {busy === f.key ? "匯出中…" : f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
