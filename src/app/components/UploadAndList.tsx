"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type FileItem = {
  name: string;
  size: number;
  modifiedAt: string;
  url: string;
};

export default function UploadAndList() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshFiles() {
    const res = await fetch("/api/files", { cache: "no-store" });
    if (!res.ok) {
      setError("Failed to load files");
      return;
    }
    const data = (await res.json()) as { files: FileItem[] };
    setFiles(data.files);
  }

  useEffect(() => {
    refreshFiles();
  }, []);

  async function onUpload(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setError(null);
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      await refreshFiles();
      if (inputRef.current) inputRef.current.value = "";
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error
          ? unknownError.message
          : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <form onSubmit={onUpload} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center rounded-xl border bg-gray-50/80 p-4 sm:p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition"
        />
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex justify-center items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          Your PDFs
          <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{files.length}</span>
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-gray-600">No PDFs uploaded yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border overflow-hidden bg-white shadow-sm">
            {files.map((f) => (
              <li key={f.name} className="group p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-gray-400 group-hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity=".2"/>
                      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 break-all">{f.name}</p>
                    <p className="text-xs text-gray-500">
                      {(f.size / 1024).toFixed(1)} KB • {new Date(f.modifiedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/viewer/${encodeURIComponent(f.name)}`}
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9Z"/>
                    </svg>
                    View
                  </Link>
                  <a
                    href={f.url}
                    download
                    className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-gray-100 text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 3v10m0 0 3.5-3.5M12 13 8.5 9.5M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


