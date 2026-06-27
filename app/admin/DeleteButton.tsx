"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("確定要刪除這筆日誌嗎？此動作無法復原。")) return;
    setDeleting(true);
    const res = await fetch(`/api/journals/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("刪除失敗，請再試一次。");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm font-semibold text-[var(--red)] hover:underline disabled:opacity-50"
    >
      {deleting ? "刪除中…" : "刪除"}
    </button>
  );
}
