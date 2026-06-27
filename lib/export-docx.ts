import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  HeadingLevel,
} from "docx";
import type { ExportJournal, ExportPhoto } from "./export-data";

const FULL_WIDTH = 9360; // US Letter content width (DXA)
const LABEL_W = 2200;
const CONTENT_W = FULL_WIDTH - LABEL_W;

const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

function formatDate(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

const DOCX_IMG: Record<string, "png" | "jpg" | "gif"> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

function photoParagraphs(photos: ExportPhoto[]): Paragraph[] {
  const usable = photos.filter((p) => DOCX_IMG[p.mime]);
  if (usable.length === 0) return [new Paragraph({ children: [new TextRun("")] })];
  return usable.map(
    (p) =>
      new Paragraph({
        children: [
          new ImageRun({
            type: DOCX_IMG[p.mime],
            data: p.buffer,
            transformation: { width: 200, height: 150 },
            altText: {
              title: p.original_name ?? "照片",
              description: p.original_name ?? "研究照片",
              name: p.original_name ?? "photo",
            },
          }),
        ],
      })
  );
}

function labelCell(text: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: LABEL_W, type: WidthType.DXA },
    shading: { fill: "F4ECE2", type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function contentCell(children: Paragraph[]): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: CONTENT_W, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: children.length ? children : [new Paragraph({ children: [new TextRun("")] })],
  });
}

function textParagraphs(text: string | null): Paragraph[] {
  if (!text) return [new Paragraph({ children: [new TextRun("")] })];
  return text.split("\n").map((line) => new Paragraph({ children: [new TextRun(line)] }));
}

function row(label: string, content: Paragraph[]): TableRow {
  return new TableRow({ children: [labelCell(label), contentCell(content)] });
}

function journalBlock(j: ExportJournal): (Paragraph | Table)[] {
  const sessionTitle =
    j.session_number != null ? `科展研究日誌　第 ${j.session_number} 次` : "科展研究日誌";

  const rows: TableRow[] = [
    row("當天科展所做的事情", textParagraphs(j.content)),
    row("發現與數據", textParagraphs(j.findings)),
    row("遇到的問題", textParagraphs(j.problems)),
    row("待辦事項", textParagraphs(j.todos)),
    row("下次要改進", textParagraphs(j.next_improvements)),
    row("照片／檔名編號", textParagraphs(j.photo_refs)),
  ];

  if (j.photos.length > 0) {
    rows.push(row("照片紀錄", photoParagraphs(j.photos)));
  }

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      children: [new TextRun({ text: sessionTitle, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `日期：${formatDate(j.date)}　　時間：${j.time ?? "　"}　　地點：${
            j.location ?? "　"
          }　　記錄者：${j.recorder ?? "　"}`,
          size: 20,
        }),
      ],
    }),
    new Table({
      width: { size: FULL_WIDTH, type: WidthType.DXA },
      columnWidths: [LABEL_W, CONTENT_W],
      rows,
    }),
    new Paragraph({ children: [new TextRun("")] }),
  ];
}

export async function buildDocx(journals: ExportJournal[]): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "🐻 黑熊老師科展日誌", bold: true, size: 36 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: "研究歷程紀錄", size: 22, color: "7A6153" })],
    }),
  ];

  if (journals.length === 0) {
    children.push(new Paragraph({ children: [new TextRun("沒有可匯出的日誌。")] }));
  } else {
    journals.forEach((j) => children.push(...journalBlock(j)));
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Microsoft JhengHei", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}
