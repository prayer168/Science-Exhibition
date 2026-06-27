import path from "path";
import fs from "fs";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

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
