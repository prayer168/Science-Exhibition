import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import path from "path";
import { writeFile } from "fs/promises";
import { journalDb } from "@/lib/db";
import { UPLOAD_DIR, ensureUploadDir, isAllowedImage, extFor } from "@/lib/uploads";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(journalDb.getPhotos(Number(id)));
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journalId = Number(id);

  if (!journalDb.getById(journalId)) {
    return NextResponse.json({ error: "找不到此筆日誌" }, { status: 404 });
  }

  const formData = await request.formData();
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "沒有收到任何檔案" }, { status: 400 });
  }

  ensureUploadDir();
  const saved = [];

  for (const file of files) {
    if (!isAllowedImage(file.type)) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${extFor(file.type, file.name)}`;
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
    saved.push(journalDb.addPhoto(journalId, filename, file.name));
  }

  if (saved.length === 0) {
    return NextResponse.json({ error: "檔案格式不支援（請上傳圖片）" }, { status: 400 });
  }

  return NextResponse.json(saved, { status: 201 });
}
