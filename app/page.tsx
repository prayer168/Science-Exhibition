import { journalDb } from "@/lib/db";
import { FIELD_LABELS } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function Section({ label, text, tone }: { label: string; text: string | null; tone?: "problem" | "todo" }) {
  if (!text) return null;
  const toneClass =
    tone === "problem"
      ? "bg-[var(--red-light)] border-l-4 border-[var(--red)]"
      : tone === "todo"
      ? "bg-[var(--blue-light)] border-l-4 border-[var(--blue)]"
      : "bg-[var(--accent-light)] border-l-4 border-[var(--accent)]";
  return (
    <div className={`rounded-lg p-3 ${toneClass}`}>
      <div className="field-label">{label}</div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const { q, from, to } = await searchParams;
  const journals = journalDb.getAllWithPhotos({ q, from, to });
  const filtered = !!(q || from || to);

  return (
    <div>
      <div className="bear-card p-6 mb-6 text-center">
        <div className="text-4xl mb-2">🐻📔</div>
        <h1 className="text-2xl font-black mb-1">研究日誌牆</h1>
        <p className="text-[var(--muted)]">
          這裡記錄了科展研究的每一步。每一頁都是最重要的原始證據。
        </p>
      </div>

      <Suspense>
        <SearchBar basePath="/" />
      </Suspense>

      {filtered && (
        <p className="text-sm text-[var(--muted)] mb-4">
          找到 {journals.length} 筆符合條件的日誌
          <Link href="/" className="text-[var(--accent)] ml-2 hover:underline">
            清除篩選
          </Link>
        </p>
      )}

      {journals.length === 0 ? (
        <div className="bear-card p-12 text-center text-[var(--muted)]">
          <div className="text-3xl mb-3">🌱</div>
          <p className="mb-4">{filtered ? "沒有符合條件的日誌。" : "還沒有任何日誌記錄。"}</p>
          {!filtered && (
            <Link href="/admin" className="btn-primary inline-block">
              前往管理後台新增第一篇
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {journals.map((j) => (
            <article key={j.id} className="bear-card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                <div className="flex items-baseline gap-3">
                  {j.session_number != null && (
                    <span className="bg-[var(--bear-brown)] text-white text-sm font-bold px-3 py-1 rounded-full">
                      第 {j.session_number} 次
                    </span>
                  )}
                  <h2 className="text-lg font-bold">{formatDate(j.date)}</h2>
                  {j.time && <span className="text-sm text-[var(--muted)]">{j.time}</span>}
                </div>
                <div className="text-sm text-[var(--muted)] flex gap-3">
                  {j.location && <span>📍 {j.location}</span>}
                  {j.recorder && <span>✏️ {j.recorder}</span>}
                </div>
              </div>

              <div className="space-y-3">
                <Section label={FIELD_LABELS.content} text={j.content} />
                <Section label={FIELD_LABELS.findings} text={j.findings} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Section label={FIELD_LABELS.problems} text={j.problems} tone="problem" />
                  <Section label={FIELD_LABELS.todos} text={j.todos} tone="todo" />
                </div>
                <Section label={FIELD_LABELS.next_improvements} text={j.next_improvements} />

                {j.photos.length > 0 && (
                  <div>
                    <div className="field-label">照片紀錄</div>
                    <div className="flex flex-wrap gap-2">
                      {j.photos.map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={p.id}
                          src={`/api/uploads/${p.filename}`}
                          alt={p.original_name ?? "照片"}
                          className="h-28 w-28 object-cover rounded-lg border border-[var(--border)]"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {j.photo_refs && (
                  <p className="text-xs text-[var(--muted)]">🖼️ {FIELD_LABELS.photo_refs}：{j.photo_refs}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
