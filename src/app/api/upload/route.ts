import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const originalName = file.name || "upload.pdf";
    const isPdfByMime = (file as File).type === "application/pdf";
    const isPdfByExt = originalName.toLowerCase().endsWith(".pdf");

    if (!isPdfByMime && !isPdfByExt) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .replace("Z", "");

    const safeBaseName = path
      .basename(originalName)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const finalName = safeBaseName.toLowerCase().endsWith(".pdf")
      ? safeBaseName
      : `${safeBaseName}.pdf`;

    const nameWithTimestamp = `${timestamp}_${finalName}`;
    const filePath = path.join(uploadsDir, nameWithTimestamp);

    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    const urlPath = `/uploads/${encodeURIComponent(nameWithTimestamp)}`;
    return NextResponse.json({ message: "Uploaded", name: nameWithTimestamp, url: urlPath });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}


