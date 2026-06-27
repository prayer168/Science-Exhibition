import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { journalDb } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = journalDb.getPhoto(Number(id));
  if (!photo) return NextResponse.json({ error: "找不到照片" }, { status: 404 });

  try {
    await unlink(path.join(UPLOAD_DIR, photo.filename));
  } catch {
    // 檔案可能已不存在，忽略
  }
  journalDb.deletePhoto(Number(id));
  return NextResponse.json({ success: true });
}
