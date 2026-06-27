import { journalDb } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import DeleteButton from "./DeleteButton";
import SearchBar from "../SearchBar";
import ExportMenu from "./ExportMenu";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const { q, from, to } = await searchParams;
  const journals = journalDb.getAll({ q, from, to });

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (from) exportQuery.set("from", from);
  if (to) exportQuery.set("to", to);
  const exportQs = exportQuery.toString();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">管理後台</h1>
          <p className="text-[var(--muted)] text-sm mt-1">共 {journals.length} 篇日誌</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu label="匯出全部" query={exportQs} />
          <Link href="/admin/new" className="btn-primary">
            ＋ 新增日誌
          </Link>
        </div>
      </div>

      <Suspense>
        <SearchBar basePath="/admin" />
      </Suspense>

      {journals.length === 0 ? (
        <div className="bear-card p-12 text-center text-[var(--muted)]">
          {q || from || to ? "沒有符合條件的日誌。" : "還沒有任何日誌，點右上角開始記錄吧！"}
        </div>
      ) : (
        <div className="bear-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--accent-light)] text-[var(--bear-brown)]">
              <tr>
                <th className="text-left px-4 py-3 font-bold">次數</th>
                <th className="text-left px-4 py-3 font-bold">年月日</th>
                <th className="text-left px-4 py-3 font-bold">當天科展所做的事情</th>
                <th className="text-left px-4 py-3 font-bold w-44">操作</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((j) => (
                <tr key={j.id} className="border-t border-[var(--border)] hover:bg-[#fffaf3]">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {j.session_number != null ? `第 ${j.session_number} 次` : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(j.date)}</td>
                  <td className="px-4 py-3 text-[var(--text)] max-w-md truncate">{j.content}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/${j.id}`} className="text-sm font-semibold text-[var(--blue)] hover:underline">
                        編輯
                      </Link>
                      <ExportMenu label="匯出" id={j.id} compact />
                      <DeleteButton id={j.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
