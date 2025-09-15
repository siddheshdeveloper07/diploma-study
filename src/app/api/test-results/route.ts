import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { score, totalQuestions, correctAnswers, timeTaken, answers } = body;

    // Here you could save the results to a database
    // For now, we'll just return a success response
    const result = {
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      timestamp: new Date().toISOString(),
      answers
    };

    return NextResponse.json({ 
      success: true, 
      message: "Test results saved successfully",
      result 
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save test results" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  // This could return test history from a database
  return NextResponse.json({ 
    message: "Test results API endpoint" 
  });
}
