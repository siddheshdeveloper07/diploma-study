import MCQTest from "../components/MCQTest";
import Link from "next/link";

export default function MCQTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Diploma Study Platform
              </h1>
              <p className="text-sm text-gray-600">Master your subjects with interactive tests</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to PDFs
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <MCQTest />
      </main>
      
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-500 text-center">
          <p>Built with Next.js and Tailwind CSS • Interactive MCQ Testing Platform</p>
        </div>
      </footer>
    </div>
  );
}
