"use client";

import { useState, useEffect } from "react";
import { MCQQuestion, acidBaseMCQQuestions } from "@/data/mcqQuestions";

interface UploadedQuestionSet {
  id: string;
  name: string;
  filename: string;
  questions: MCQQuestion[];
  uploadDate: string;
}

interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: { [key: number]: number };
  timeTaken: number;
}

export default function MCQTest() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(15);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [uploadedQuestionSets, setUploadedQuestionSets] = useState<UploadedQuestionSet[]>([]);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<string>('default');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Function to shuffle array and select random questions
  const shuffleAndSelectQuestions = (count: number) => {
    const questionPool = selectedQuestionSet === 'default' 
      ? acidBaseMCQQuestions 
      : uploadedQuestionSets.find(set => set.id === selectedQuestionSet)?.questions || acidBaseMCQQuestions;
    
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Function to handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload-docx', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.success) {
        const questionSet: UploadedQuestionSet = {
          id: Date.now().toString(),
          name: file.name.replace('.docx', ''),
          filename: data.filename,
          questions: data.questions,
          uploadDate: new Date().toISOString(),
        };

        setUploadedQuestionSets(prev => [...prev, questionSet]);
        setSelectedQuestionSet(questionSet.id);
        setUploadSuccess('Document uploaded successfully! Questions extracted and ready for testing.');
        
        // Reset file input
        event.target.value = '';
      } else {
        throw new Error(data.error || 'Upload failed');
      }

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Initialize questions when component mounts or question count changes
  useEffect(() => {
    if (!testStarted) {
      setQuestions(shuffleAndSelectQuestions(selectedQuestionCount));
    }
  }, [selectedQuestionCount, testStarted, selectedQuestionSet, uploadedQuestionSets, shuffleAndSelectQuestions]);

  const startTest = () => {
    setTestStarted(true);
    setStartTime(new Date());
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestCompleted(false);
    setResult(null);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitTest = () => {
    const endTime = new Date();
    const timeTaken = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    
    let correctCount = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const testResult: TestResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      answers: selectedAnswers,
      timeTaken
    };

    setResult(testResult);
    setTestCompleted(true);
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestStarted(false);
    setTestCompleted(false);
    setStartTime(null);
    setResult(null);
    setQuestions(shuffleAndSelectQuestions(selectedQuestionCount));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! You have a great understanding of acids and bases.";
    if (score >= 80) return "Very good! You have a solid understanding of the topic.";
    if (score >= 70) return "Good! You have a decent understanding but can improve.";
    if (score >= 60) return "Fair! You need to review some concepts.";
    return "You need to study more about acids and bases.";
  };

  if (!testStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Acids & Bases MCQ Test</h1>
            <p className="text-lg text-gray-600 mb-6">Test your knowledge about acids, bases, and pH</p>
          </div>

          {/* Question Set Selection */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Question Set</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="questionSet"
                    value="default"
                    checked={selectedQuestionSet === 'default'}
                    onChange={(e) => setSelectedQuestionSet(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium text-gray-700">Default Acids & Bases</span>
                </label>
                {uploadedQuestionSets.map((set) => (
                  <label key={set.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="questionSet"
                      value={set.id}
                      checked={selectedQuestionSet === set.id}
                      onChange={(e) => setSelectedQuestionSet(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-lg font-medium text-gray-700">{set.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Question Count Selection */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Test Length</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="questionCount"
                  value="15"
                  checked={selectedQuestionCount === 15}
                  onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-lg font-medium text-gray-700">15 Questions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="questionCount"
                  value="30"
                  checked={selectedQuestionCount === 30}
                  onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-lg font-medium text-gray-700">30 Questions</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="questionCount"
                  value="50"
                  checked={selectedQuestionCount === 50}
                  onChange={(e) => setSelectedQuestionCount(Number(e.target.value))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-lg font-medium text-gray-700">50 Questions</span>
              </label>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Document</h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="docx-upload"
                />
                <label
                  htmlFor="docx-upload"
                  className={`cursor-pointer block ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {isUploading ? 'Uploading...' : 'Click to upload DOCX file'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Only .docx files are supported
                  </p>
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-800">{uploadSuccess}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload a DOCX file containing MCQ questions</li>
                  <li>• Questions should be numbered (1., 2., etc.)</li>
                  <li>• Each question should have 4 options (A, B, C, D)</li>
                  <li>• The system will extract questions and create a new test</li>
                  <li>• You can then select this test from the dropdown above</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {selectedQuestionCount} Questions
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  Multiple Choice
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                  No Time Limit
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                  {selectedQuestionSet === 'default' ? 'Default Set' : 'Custom Set'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={startTest}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (testCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
              result.score >= 80 ? 'bg-green-100' : result.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
            <p className="text-lg text-gray-600 mb-6">{getScoreMessage(result.score)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{result.correctAnswers}</div>
              <div className="text-sm text-blue-800">Correct Answers</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{result.totalQuestions - result.correctAnswers}</div>
              <div className="text-sm text-green-800">Incorrect Answers</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{result.timeTaken}s</div>
              <div className="text-sm text-purple-800">Time Taken</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Detailed Results</h2>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const userAnswer = result.answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                const isAnswered = userAnswer !== undefined;

                return (
                  <div key={question.id} className={`border rounded-lg p-4 ${
                    isCorrect ? 'bg-green-50 border-green-200' : 
                    isAnswered ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCorrect ? 'bg-green-500 text-white' : 
                        isAnswered ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className={`text-sm ${
                              optionIndex === question.correctAnswer ? 'text-green-700 font-medium' :
                              optionIndex === userAnswer && !isCorrect ? 'text-red-700 font-medium' :
                              'text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}. {option}
                              {optionIndex === question.correctAnswer && ' ✓'}
                              {optionIndex === userAnswer && !isCorrect && ' ✗'}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={resetTest}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Take Test Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion?.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    selectedAnswers[currentQuestion.id] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-3">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion.id] === undefined}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitTest}
                disabled={Object.keys(selectedAnswers).length < questions.length}
                className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigation</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : selectedAnswers[questions[index].id] !== undefined
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
