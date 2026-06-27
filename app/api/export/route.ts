import { NextRequest, NextResponse } from "next/server";
import { getExportJournals } from "@/lib/export-data";
import { buildHtml } from "@/lib/export-html";
import { buildDocx } from "@/lib/export-docx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filename(base: string, ext: string) {
  return `${base}-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const format = (sp.get("format") ?? "html").toLowerCase();
  const idParam = sp.get("id");

  const journals = getExportJournals({
    id: idParam ? Number(idParam) : undefined,
    filter: {
      q: sp.get("q") ?? undefined,
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
    },
  });

  const base = idParam ? `科展日誌-第${journals[0]?.session_number ?? idParam}次` : "科展日誌";

  if (format === "html") {
    const html = buildHtml(journals);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename(base, "html"))}`,
      },
    });
  }

  if (format === "docx") {
    const buffer = await buildDocx(journals);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename(base, "docx"))}`,
      },
    });
  }

  if (format === "pdf") {
    const { renderPdf } = await import("@/lib/export-pdf");
    const html = buildHtml(journals);
    const buffer = await renderPdf(html);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename(base, "pdf"))}`,
      },
    });
  }

  return NextResponse.json({ error: "不支援的匯出格式" }, { status: 400 });
}
