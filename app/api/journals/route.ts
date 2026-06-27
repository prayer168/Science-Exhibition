import { NextRequest, NextResponse } from "next/server";
import { journalDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const journals = journalDb.getAll({
    q: sp.get("q") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  return NextResponse.json(journals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.date || !body.content) {
    return NextResponse.json({ error: "日期和研究內容為必填欄位" }, { status: 400 });
  }

  const journal = journalDb.create({
    date: body.date,
    time: body.time ?? null,
    session_number: body.session_number ?? null,
    location: body.location ?? null,
    recorder: body.recorder ?? null,
    content: body.content,
    findings: body.findings ?? null,
    photo_refs: body.photo_refs ?? null,
    problems: body.problems ?? null,
    todos: body.todos ?? null,
    next_improvements: body.next_improvements ?? null,
  });

  return NextResponse.json(journal, { status: 201 });
}
