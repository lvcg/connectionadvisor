"use client";

import { useState } from "react";
import { FilePenLine, FileScan, Trash2, Upload } from "lucide-react";
import type { VaultDocument, VaultDocumentType } from "@/types/homey";
import { formatTimestamp } from "@/lib/utils";

type DocumentUploadCardProps = {
  title: string;
  description: string;
  type: VaultDocumentType;
  locked?: boolean;
};

export function DocumentUploadCard({ title, description, type, locked = false }: DocumentUploadCardProps) {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [notice, setNotice] = useState("Upload or scan a document to attach it to this record.");

  const addMockDocument = (source: "upload" | "scan") => {
    if (locked) {
      setNotice("Document storage is a DomiVault Plus feature.");
      return;
    }

    const uploadedAt = new Date().toISOString();
    const document: VaultDocument = {
      id: crypto.randomUUID(),
      name: source === "scan" ? `${title} scan.jpg` : `${title} upload.pdf`,
      type,
      url: `${type}/${Date.now()}-${source}`,
      linkedTo: title,
      uploadedAt,
    };

    setDocuments((current) => [document, ...current]);
    setNotice(`${document.name} saved at ${formatTimestamp(uploadedAt)}.`);
  };

  const renameDocument = (document: VaultDocument) => {
    if (locked) return;
    const nextName = window.prompt("Update document name", document.name);
    if (!nextName?.trim()) return;
    setDocuments((current) => current.map((item) => (item.id === document.id ? { ...item, name: nextName.trim() } : item)));
    setNotice(`${nextName.trim()} updated.`);
  };

  const deleteDocument = (document: VaultDocument) => {
    if (locked) return;
    setDocuments((current) => current.filter((item) => item.id !== document.id));
    setNotice(`${document.name} deleted.`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex gap-2">
          <button disabled={locked} onClick={() => addMockDocument("upload")} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <button disabled={locked} onClick={() => addMockDocument("scan")} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
            <FileScan className="h-4 w-4" />
            Scan
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{notice}</p>

      {documents.length > 0 && (
        <div className="mt-4 grid gap-2">
          {documents.map((document) => (
            <div key={document.id} className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{document.name}</p>
                <p className="text-xs text-slate-500">{formatTimestamp(document.uploadedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => renameDocument(document)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
                  <FilePenLine className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button onClick={() => deleteDocument(document)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-700 dark:border-rose-400/20 dark:text-rose-200">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
