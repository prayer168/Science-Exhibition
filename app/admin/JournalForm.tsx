"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FIELD_LABELS, type JournalWithPhotos, type Photo } from "@/lib/types";
import PhotoUploader, { type PendingFile } from "./PhotoUploader";

type Props = { journal?: JournalWithPhotos };

export default function JournalForm({ journal }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(journal?.photos ?? []);
  const [pending, setPending] = useState<PendingFile[]>([]);

  const [form, setForm] = useState({
    date: journal?.date ?? new Date().toISOString().slice(0, 10),
    time: journal?.time ?? "",
    session_number: journal?.session_number?.toString() ?? "",
    location: journal?.location ?? "",
    recorder: journal?.recorder ?? "",
    content: journal?.content ?? "",
    findings: journal?.findings ?? "",
    photo_refs: journal?.photo_refs ?? "",
    problems: journal?.problems ?? "",
    todos: journal?.todos ?? "",
    next_improvements: journal?.next_improvements ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function uploadPhotos(journalId: number) {
    if (pending.length === 0) return;
    const fd = new FormData();
    pending.forEach((p) => fd.append("photos", p.file));
    await fetch(`/api/journals/${journalId}/photos`, { method: "POST", body: fd });
  }

  async function deleteExisting(photoId: number) {
    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (res.ok) setExistingPhotos((ps) => ps.filter((p) => p.id !== photoId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.date || !form.content.trim()) {
      setError("「年月日」和「當天科展所做的事情」為必填欄位。");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      session_number: form.session_number ? Number(form.session_number) : null,
    };

    const res = await fetch(journal ? `/api/journals/${journal.id}` : "/api/journals", {
      method: journal ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setSaving(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "儲存失敗，請再試一次。");
      return;
    }

    const saved = await res.json();
    await uploadPhotos(saved.id);

    setSaving(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bear-card p-6 space-y-5">
      {error && (
        <div className="bg-[var(--red-light)] border border-[var(--red)] text-[var(--red)] rounded-lg px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid sm:grid-cols-5 gap-4">
        <div>
          <label className="field-label">{FIELD_LABELS.date} *</label>
          <input type="date" className="field-input" value={form.date} onChange={set("date")} required />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.time}</label>
          <input className="field-input" value={form.time} onChange={set("time")} placeholder="例：14:00-16:00" />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.session_number}</label>
          <input
            type="number"
            min={1}
            className="field-input"
            value={form.session_number}
            onChange={set("session_number")}
            placeholder="第幾次"
          />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.location}</label>
          <input className="field-input" value={form.location} onChange={set("location")} placeholder="實驗室、教室…" />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.recorder}</label>
          <input className="field-input" value={form.recorder} onChange={set("recorder")} placeholder="記錄人姓名" />
        </div>
      </div>

      <div>
        <label className="field-label">{FIELD_LABELS.content} *</label>
        <textarea
          className="field-textarea"
          value={form.content}
          onChange={set("content")}
          placeholder="今天進行的研究步驟、上課內容、實驗或討論…"
          required
        />
      </div>

      <div>
        <label className="field-label">{FIELD_LABELS.findings}</label>
        <textarea
          className="field-textarea"
          value={form.findings}
          onChange={set("findings")}
          placeholder="觀察到的現象、測量到的數據、圖示…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">{FIELD_LABELS.problems}</label>
          <textarea
            className="field-textarea"
            value={form.problems}
            onChange={set("problems")}
            placeholder="遇到的困難、異常、想不通的地方…"
          />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.todos}</label>
          <textarea
            className="field-textarea"
            value={form.todos}
            onChange={set("todos")}
            placeholder="下次要做的事、需要準備的材料…"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">{FIELD_LABELS.next_improvements}</label>
          <textarea
            className="field-textarea"
            value={form.next_improvements}
            onChange={set("next_improvements")}
            placeholder="研究方法可以怎麼改進…"
          />
        </div>
        <div>
          <label className="field-label">{FIELD_LABELS.photo_refs}</label>
          <textarea
            className="field-textarea"
            value={form.photo_refs}
            onChange={set("photo_refs")}
            placeholder="IMG_001、照片A…"
          />
        </div>
      </div>

      <PhotoUploader
        existing={existingPhotos}
        pending={pending}
        onPendingChange={setPending}
        onDeleteExisting={journal ? deleteExisting : undefined}
      />

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "儲存中…" : journal ? "更新日誌" : "新增日誌"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push("/admin")}>
          取消
        </button>
      </div>
    </form>
  );
}
