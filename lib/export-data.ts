import fs from "fs";
import path from "path";
import { journalDb, type JournalFilter, type JournalWithPhotos } from "./db";
import { UPLOAD_DIR } from "./uploads";

export type ExportPhoto = {
  original_name: string | null;
  buffer: Buffer;
  mime: string;
  dataUri: string;
};

export type ExportJournal = Omit<JournalWithPhotos, "photos"> & {
  photos: ExportPhoto[];
};

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return map[ext.toLowerCase()] ?? "image/jpeg";
}

function loadPhotos(j: JournalWithPhotos): ExportPhoto[] {
  const result: ExportPhoto[] = [];
  for (const p of j.photos) {
    const filePath = path.join(UPLOAD_DIR, p.filename);
    if (!fs.existsSync(filePath)) continue;
    const buffer = Buffer.from(fs.readFileSync(filePath));
    const mime = mimeFromExt(path.extname(p.filename));
    result.push({
      original_name: p.original_name,
      buffer,
      mime,
      dataUri: `data:${mime};base64,${buffer.toString("base64")}`,
    });
  }
  return result;
}

export function getExportJournals(opts: { id?: number; filter?: JournalFilter }): ExportJournal[] {
  let journals: JournalWithPhotos[];
  if (opts.id != null) {
    const one = journalDb.getByIdWithPhotos(opts.id);
    journals = one ? [one] : [];
  } else {
    journals = journalDb.getAllWithPhotos(opts.filter ?? {});
  }
  // 匯出時依日期由舊到新排列，較符合日誌時間順序
  journals = [...journals].reverse();
  return journals.map((j) => ({ ...j, photos: loadPhotos(j) }));
}
