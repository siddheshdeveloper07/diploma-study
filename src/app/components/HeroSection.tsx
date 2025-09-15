export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-900/10 opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-100 text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Your Learning Journey Starts Here
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Master Your{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Diploma Studies
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Transform your study experience with our comprehensive platform. Upload materials, 
            practice with interactive MCQs, and track your progress all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <a
              href="/mcq-test"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-white/25"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Start MCQ Test
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#upload-section"
              className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white rounded-2xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              Upload PDFs
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div className="group text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:shadow-2xl group-hover:shadow-white/25 transition-all duration-300">
              <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Smart Upload System</h3>
            <p className="text-blue-100 leading-relaxed">
              Effortlessly upload and organize your PDF study materials with our intelligent file management system
            </p>
          </div>
          
          <div className="group text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:shadow-2xl group-hover:shadow-white/25 transition-all duration-300">
              <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Interactive MCQ Tests</h3>
            <p className="text-blue-100 leading-relaxed">
              Challenge yourself with comprehensive multiple choice questions designed to test and improve your knowledge
            </p>
          </div>
          
          <div className="group text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:shadow-2xl group-hover:shadow-white/25 transition-all duration-300">
              <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4">Progress Tracking</h3>
            <p className="text-blue-100 leading-relaxed">
              Monitor your learning journey with detailed analytics, results, and personalized improvement recommendations
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
    </div>
  );
}
