import path from "path";
import fs from "fs";

// 照片存到持久磁碟（DATA_DIR/uploads）；本機未設定時預設用專案下的 data/uploads。
// 不再放 public/ 下，改由 /api/uploads/[name] 路由提供，才能在容器重啟後保留。
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, "uploads");

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"]);

export function isAllowedImage(type: string) {
  return ALLOWED.has(type);
}

export function extFor(type: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/heic": ".heic",
  };
  return map[type] ?? ".bin";
}
