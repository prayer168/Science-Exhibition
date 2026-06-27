import { journalDb } from "@/lib/db";
import { notFound } from "next/navigation";
import JournalForm from "../JournalForm";

export const dynamic = "force-dynamic";

export default async function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const journal = journalDb.getByIdWithPhotos(Number(id));
  if (!journal) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">🐻 編輯研究日誌</h1>
      <JournalForm journal={journal} />
    </div>
  );
}
