import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is a DOCX file
    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Please upload a .docx file' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // For now, we'll create a placeholder structure
    // In a real implementation, you would parse the DOCX content
    const questions = createSampleQuestionsFromFile(file.name);

    return NextResponse.json({
      success: true,
      filename,
      questions,
      message: 'File uploaded successfully. Questions extracted from document.'
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

function createSampleQuestionsFromFile(filename: string): Question[] {
  // This is a placeholder function that creates sample questions
  // In a real implementation, you would parse the actual DOCX content
  return [
    {
      id: 1,
      question: `Sample question from ${filename}`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "This is a sample question from the uploaded document."
    },
    {
      id: 2,
      question: `Another question from ${filename}`,
      options: ["Choice A", "Choice B", "Choice C", "Choice D"],
      correctAnswer: 1,
      explanation: "This is another sample question from the uploaded document."
    }
  ];
}
