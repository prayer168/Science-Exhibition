import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// DATA_DIR 可指向持久磁碟（Railway Volume）；本機未設定時預設用專案下的 data/
const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "journals.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT,
    session_number INTEGER,
    location TEXT,
    recorder TEXT,
    content TEXT NOT NULL,
    findings TEXT,
    photo_refs TEXT,
    problems TEXT,
    todos TEXT,
    next_improvements TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
  );
`);

// 為舊資料庫補上 time 欄位（若不存在）
const cols = db.prepare("PRAGMA table_info(journals)").all() as { name: string }[];
if (!cols.some((c) => c.name === "time")) {
  db.exec("ALTER TABLE journals ADD COLUMN time TEXT");
}

export type Photo = {
  id: number;
  journal_id: number;
  filename: string;
  original_name: string | null;
  created_at: string;
};

export type Journal = {
  id: number;
  date: string;
  time: string | null;
  session_number: number | null;
  location: string | null;
  recorder: string | null;
  content: string;
  findings: string | null;
  photo_refs: string | null;
  problems: string | null;
  todos: string | null;
  next_improvements: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalWithPhotos = Journal & { photos: Photo[] };

export type JournalInput = Omit<Journal, "id" | "created_at" | "updated_at">;

export type JournalFilter = {
  q?: string;
  from?: string;
  to?: string;
};

export const journalDb = {
  getAll(filter: JournalFilter = {}): Journal[] {
    const where: string[] = [];
    const params: Record<string, string> = {};

    if (filter.q) {
      where.push(
        `(content LIKE @q OR findings LIKE @q OR problems LIKE @q OR todos LIKE @q
          OR next_improvements LIKE @q OR location LIKE @q OR recorder LIKE @q)`
      );
      params.q = `%${filter.q}%`;
    }
    if (filter.from) {
      where.push("date >= @from");
      params.from = filter.from;
    }
    if (filter.to) {
      where.push("date <= @to");
      params.to = filter.to;
    }

    const sql = `SELECT * FROM journals ${
      where.length ? "WHERE " + where.join(" AND ") : ""
    } ORDER BY date DESC, session_number DESC, id DESC`;

    return db.prepare(sql).all(params) as Journal[];
  },

  getAllWithPhotos(filter: JournalFilter = {}): JournalWithPhotos[] {
    return this.getAll(filter).map((j) => ({ ...j, photos: this.getPhotos(j.id) }));
  },

  getById(id: number): Journal | undefined {
    return db.prepare("SELECT * FROM journals WHERE id = ?").get(id) as Journal | undefined;
  },

  getByIdWithPhotos(id: number): JournalWithPhotos | undefined {
    const j = this.getById(id);
    if (!j) return undefined;
    return { ...j, photos: this.getPhotos(id) };
  },

  create(data: JournalInput): Journal {
    const stmt = db.prepare(`
      INSERT INTO journals (date, time, session_number, location, recorder, content, findings, photo_refs, problems, todos, next_improvements)
      VALUES (@date, @time, @session_number, @location, @recorder, @content, @findings, @photo_refs, @problems, @todos, @next_improvements)
    `);
    const result = stmt.run(data);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, data: Partial<JournalInput>): Journal | undefined {
    const fields = Object.keys(data)
      .map((k) => `${k} = @${k}`)
      .join(", ");
    if (!fields) return this.getById(id);
    db.prepare(`UPDATE journals SET ${fields}, updated_at = datetime('now', 'localtime') WHERE id = @id`).run({ ...data, id });
    return this.getById(id);
  },

  delete(id: number): void {
    db.prepare("DELETE FROM journals WHERE id = ?").run(id);
  },

  // ---- 照片 ----
  getPhotos(journalId: number): Photo[] {
    return db
      .prepare("SELECT * FROM photos WHERE journal_id = ? ORDER BY id ASC")
      .all(journalId) as Photo[];
  },

  addPhoto(journalId: number, filename: string, originalName: string): Photo {
    const result = db
      .prepare("INSERT INTO photos (journal_id, filename, original_name) VALUES (?, ?, ?)")
      .run(journalId, filename, originalName);
    return db.prepare("SELECT * FROM photos WHERE id = ?").get(result.lastInsertRowid as number) as Photo;
  },

  getPhoto(photoId: number): Photo | undefined {
    return db.prepare("SELECT * FROM photos WHERE id = ?").get(photoId) as Photo | undefined;
  },

  deletePhoto(photoId: number): void {
    db.prepare("DELETE FROM photos WHERE id = ?").run(photoId);
  },
};

export default db;
