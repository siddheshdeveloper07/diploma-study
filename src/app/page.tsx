import UploadAndList from "./components/UploadAndList";
import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Diploma Study Platform
              </h1>
              <p className="text-sm text-gray-600">Upload and view your PDF materials</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/mcq-test"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Take MCQ Test
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <HeroSection />
      
      <main id="upload-section" className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Study Materials</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload and organize your PDF study materials. Access them anytime, anywhere.
          </p>
        </div>
        
        <div className="rounded-xl border bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <UploadAndList />
        </div>
      </main>
      
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-gray-500 text-center">
          <p>Built with Next.js and Tailwind CSS • Interactive Study Platform</p>
        </div>
      </footer>
    </div>
  );
}
