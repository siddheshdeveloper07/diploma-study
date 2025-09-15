import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const entries = await fs.readdir(uploadsDir);

    const pdfEntries = entries.filter((name) => name.toLowerCase().endsWith(".pdf"));

    const files = await Promise.all(
      pdfEntries.map(async (name) => {
        const fullPath = path.join(uploadsDir, name);
        const stat = await fs.stat(fullPath);
        return {
          name,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          url: `/uploads/${encodeURIComponent(name)}`,
        };
      })
    );

    // Sort by modified date desc
    files.sort((a, b) => (a.modifiedAt < b.modifiedAt ? 1 : -1));

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}


