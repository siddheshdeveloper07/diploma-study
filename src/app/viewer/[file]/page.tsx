import { notFound } from "next/navigation";
import Link from "next/link";
import { UploadService } from "@/lib/uploadService";

type Props = {
  params: Promise<{ file: string }>;
};

export default async function PdfViewerPage({ params }: Props) {
  const { file } = await params;
  const decoded = decodeURIComponent(file);

  if (!decoded.toLowerCase().endsWith(".pdf")) {
    notFound();
  }

  // Get file metadata from the upload service
  const files = await UploadService.getFilesList();
  const fileMetadata = files.find(f => f.name === decoded);
  
  if (!fileMetadata) {
    notFound();
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M10 19a1 1 0 0 1-.707-.293l-6-6a1 1 0 0 1 0-1.414l6-6A1 1 0 0 1 11 6v3h9a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-9v3a1 1 0 0 1-1 1Z"/>
              </svg>
              Back
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold">PDF Viewer</h1>
          </div>
          <a
            href={fileMetadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Open original
          </a>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white shadow">
          <iframe
            src={`${fileMetadata.url}#toolbar=1`}
            title={fileMetadata.name}
            className="w-full h-[80vh]"
          />
        </div>
      </div>
    </div>
  );
}


