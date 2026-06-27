"use client";

import { useState, useRef, useCallback } from "react";
import type { Photo } from "@/lib/types";

export type PendingFile = { id: string; file: File; preview: string };

type Props = {
  // 已儲存的照片（編輯模式）
  existing?: Photo[];
  // 尚未上傳的暫存檔（由父層保管，新增模式用）
  pending: PendingFile[];
  onPendingChange: (files: PendingFile[]) => void;
  onDeleteExisting?: (photoId: number) => void;
};

export default function PhotoUploader({ existing = [], pending, onPendingChange, onDeleteExisting }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      const next = images.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.round(performance.now())}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      onPendingChange([...pending, ...next]);
    },
    [pending, onPendingChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removePending(id: string) {
    const target = pending.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.preview);
    onPendingChange(pending.filter((p) => p.id !== id));
  }

  return (
    <div>
      <label className="field-label">照片紀錄（可拖拉多張圖片進來，或點擊選取）</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-light)]"
            : "border-[var(--border)] bg-[#fffdfa] hover:bg-[#fef8f0]"
        }`}
      >
        <div className="text-3xl mb-1">🖼️⬇️</div>
        <p className="text-sm text-[var(--muted)]">
          將照片拖曳到這裡，或<span className="text-[var(--accent)] font-semibold">點此選擇檔案</span>（支援多選）
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(existing.length > 0 || pending.length > 0) && (
        <div className="flex flex-wrap gap-3 mt-4">
          {existing.map((p) => (
            <div key={`e-${p.id}`} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/${p.filename}`}
                alt={p.original_name ?? "照片"}
                className="h-24 w-24 object-cover rounded-lg border border-[var(--border)]"
              />
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(p.id)}
                  className="absolute -top-2 -right-2 bg-[var(--red)] text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition"
                  title="刪除照片"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {pending.map((p) => (
            <div key={p.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.preview}
                alt={p.file.name}
                className="h-24 w-24 object-cover rounded-lg border-2 border-[var(--accent)]"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-[var(--accent)] text-white text-[10px] text-center py-0.5 rounded-b">
                待儲存
              </span>
              <button
                type="button"
                onClick={() => removePending(p.id)}
                className="absolute -top-2 -right-2 bg-[var(--red)] text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition"
                title="移除"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
