import FileManager from "./components/FileManager";
import HeroSection from "./components/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="border-b border-white/20 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Diploma Study Hub
              </h1>
              <p className="text-sm text-gray-600 mt-1">Your comprehensive learning companion</p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="/mcq-test"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Take MCQ Test
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <HeroSection />
      
      {/* Stats Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Study Materials</h3>
              <p className="text-gray-600">Upload and organize your PDFs</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">MCQ Tests</h3>
              <p className="text-gray-600">Interactive practice questions</p>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Progress</h3>
              <p className="text-gray-600">Track your learning journey</p>
            </div>
          </div>
        </div>
      </section>
      
      <main id="upload-section" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl text-white mb-6 shadow-xl">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Your Study Library
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload, organize, and access your PDF study materials from anywhere. 
            Build your personalized learning library with seamless file management.
          </p>
        </div>
        
        <div className="rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-md p-8 shadow-2xl shadow-blue-500/10">
          <FileManager />
        </div>
      </main>
      
      <footer className="border-t border-gray-200/50 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Built with ❤️ using Next.js and Tailwind CSS
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <span>Interactive Study Platform</span>
              <span>•</span>
              <span>PDF Management</span>
              <span>•</span>
              <span>MCQ Testing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
