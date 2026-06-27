import type { ExportJournal } from "./export-data";

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}

function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function journalSection(j: ExportJournal): string {
  const photos =
    j.photos.length > 0
      ? `<tr>
           <th class="label">照片紀錄</th>
           <td class="content">
             <div class="photos">
               ${j.photos
                 .map((p) => `<img src="${p.dataUri}" alt="${esc(p.original_name)}" />`)
                 .join("")}
             </div>
           </td>
         </tr>`
      : "";

  const sessionTitle =
    j.session_number != null ? `科展研究日誌　第 ${j.session_number} 次` : "科展研究日誌";

  return `
  <section class="journal">
    <h2 class="journal-title">${esc(sessionTitle)}</h2>
    <div class="meta">
      <span>日期：${formatDate(j.date)}</span>
      <span>時間：${esc(j.time) || "　"}</span>
      <span>地點：${esc(j.location) || "　"}</span>
      <span>記錄者：${esc(j.recorder) || "　"}</span>
    </div>
    <table class="journal-table">
      <tr><th class="label">當天科展所做的事情</th><td class="content">${esc(j.content)}</td></tr>
      <tr><th class="label">發現與數據</th><td class="content">${esc(j.findings)}</td></tr>
      <tr><th class="label">遇到的問題</th><td class="content">${esc(j.problems)}</td></tr>
      <tr><th class="label">待辦事項</th><td class="content">${esc(j.todos)}</td></tr>
      <tr><th class="label">下次要改進</th><td class="content">${esc(j.next_improvements)}</td></tr>
      <tr><th class="label">照片／檔名編號</th><td class="content">${esc(j.photo_refs)}</td></tr>
      ${photos}
    </table>
  </section>`;
}

export function buildHtml(journals: ExportJournal[], opts: { autoPrint?: boolean } = {}): string {
  const body =
    journals.length > 0
      ? journals.map(journalSection).join("\n")
      : `<p style="text-align:center;color:#888">沒有可匯出的日誌。</p>`;

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<title>黑熊老師科展日誌</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif;
    color: #2c1810;
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px;
    line-height: 1.7;
  }
  .doc-title { text-align: center; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
  .doc-sub { text-align: center; color: #7a6153; margin-bottom: 28px; font-size: 13px; }
  .journal { margin-bottom: 36px; page-break-inside: avoid; }
  .journal-title {
    font-size: 17px; font-weight: 800; background: #5c3a1e; color: #fff;
    padding: 8px 14px; border-radius: 6px 6px 0 0; margin: 0;
  }
  .meta {
    display: flex; flex-wrap: wrap; gap: 18px;
    font-size: 13px; padding: 8px 14px; background: #fef3e2;
    border: 1px solid #e0d5c9; border-top: none;
  }
  .journal-table {
    width: 100%; border-collapse: collapse; font-size: 14px;
    border: 1px solid #999; border-top: none;
  }
  .journal-table th, .journal-table td {
    border: 1px solid #999; padding: 8px 12px; vertical-align: top; text-align: left;
  }
  .label {
    width: 150px; background: #f4ece2; font-weight: 700; white-space: nowrap;
  }
  .content { min-height: 28px; }
  .photos { display: flex; flex-wrap: wrap; gap: 8px; }
  .photos img {
    max-height: 160px; max-width: 220px; object-fit: contain;
    border: 1px solid #ccc; border-radius: 4px;
  }
  .doc-footer {
    margin-top: 36px; padding-top: 14px; border-top: 1px solid #e0d5c9;
    text-align: center; font-size: 12px; color: #7a6153; line-height: 1.8;
  }
  @media print {
    body { padding: 0; }
    .journal { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="doc-title">🐻 黑熊老師科展日誌</div>
  <div class="doc-sub">研究歷程紀錄</div>
  ${body}
  <div class="doc-footer">
    開發者：陳賢宗（黑熊老師）<br/>
    © ${new Date().getFullYear()} 陳賢宗（黑熊老師）．版權所有 All rights reserved.
  </div>
  ${opts.autoPrint ? "<script>window.onload=()=>window.print()</script>" : ""}
</body>
</html>`;
}
