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

export const FIELD_LABELS = {
  date: "年月日",
  time: "時間",
  session_number: "日誌次數",
  location: "地點",
  recorder: "記錄者",
  content: "當天科展所做的事情",
  findings: "發現與數據",
  photo_refs: "照片／檔名編號",
  problems: "遇到的問題",
  todos: "待辦事項",
  next_improvements: "下次要改進",
} as const;
