import { NextRequest, NextResponse } from "next/server";
import { journalDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journal = journalDb.getById(Number(id));
  if (!journal) return NextResponse.json({ error: "找不到此筆記錄" }, { status: 404 });
  return NextResponse.json(journal);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const journal = journalDb.update(Number(id), body);
  if (!journal) return NextResponse.json({ error: "找不到此筆記錄" }, { status: 404 });
  return NextResponse.json(journal);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  journalDb.delete(Number(id));
  return NextResponse.json({ success: true });
}
