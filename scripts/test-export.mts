import fs from "fs";
import path from "path";
import { journalDb } from "../lib/db";
import { getExportJournals } from "../lib/export-data";
import { buildHtml } from "../lib/export-html";
import { buildDocx } from "../lib/export-docx";
import { renderPdf } from "../lib/export-pdf";
import { ensureUploadDir, UPLOAD_DIR } from "../lib/uploads";

const OUT = path.join(process.cwd(), "scripts", "out");
fs.mkdirSync(OUT, { recursive: true });

// 1x1 red PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

// --- seed ---
const j1 = journalDb.create({
  date: "2026-06-25",
  time: "14:00-16:00",
  session_number: 1,
  location: "自然教室",
  recorder: "小明",
  content: "架設紅外線相機，觀察黑熊活動模式。\n設定每 5 分鐘拍一張。",
  findings: "夜間活動較頻繁，共拍到 3 張影像。",
  photo_refs: "IMG_001, IMG_002",
  problems: "相機電池消耗很快。",
  todos: "準備備用電池、調整角度。",
  next_improvements: "改用大容量電池。",
});

const j2 = journalDb.create({
  date: "2026-06-27",
  time: "09:00-11:00",
  session_number: 2,
  location: "實驗室",
  recorder: "小華",
  content: "分析昨天拍到的影像資料。",
  findings: "整理出活動時間分布表。",
  photo_refs: null,
  problems: "部分影像模糊。",
  todos: "重新校正相機焦距。",
  next_improvements: null,
});

// add a photo to j1
ensureUploadDir();
const fname = `test-${Date.now()}.png`;
fs.writeFileSync(path.join(UPLOAD_DIR, fname), PNG);
journalDb.addPhoto(j1.id, fname, "黑熊夜拍.png");

console.log("Seeded journals:", j1.id, j2.id);

// --- test search ---
const byKeyword = journalDb.getAll({ q: "電池" });
console.log("搜尋『電池』:", byKeyword.length, "筆 ->", byKeyword.map((j) => j.session_number));

const byDate = journalDb.getAll({ from: "2026-06-26", to: "2026-06-28" });
console.log("日期 6/26~6/28:", byDate.length, "筆 ->", byDate.map((j) => j.session_number));

// --- exports (all journals) ---
const all = getExportJournals({});
console.log("匯出資料：", all.length, "筆，第一筆照片數：", all[0]?.photos.length);

const html = buildHtml(all);
fs.writeFileSync(path.join(OUT, "journals.html"), html, "utf8");
console.log("HTML:", html.length, "bytes");

const docx = await buildDocx(all);
fs.writeFileSync(path.join(OUT, "journals.docx"), docx);
console.log("DOCX:", docx.length, "bytes");

const pdf = await renderPdf(html);
fs.writeFileSync(path.join(OUT, "journals.pdf"), pdf);
console.log("PDF:", pdf.length, "bytes");

// cleanup seeded rows so the dev DB stays clean
journalDb.delete(j1.id);
journalDb.delete(j2.id);
try {
  fs.unlinkSync(path.join(UPLOAD_DIR, fname));
} catch {}
console.log("Cleaned up seeded journals. Done.");
