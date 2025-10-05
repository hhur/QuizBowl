import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center min-h-screen py-12">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-blue-600 mb-8">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              QuizBowlHub
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The ultimate platform for Quiz Bowl teams to practice, compete, and excel.
              Train with thousands of questions, track your progress, and compete in real-time.
            </p>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>

            <div className="mt-12">
              <p className="text-sm text-gray-500 mb-4">Test with demo accounts:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">Admin Account</p>
                  <p className="text-sm text-gray-600">admin@quizbowlhub.dev</p>
                  <p className="text-sm text-gray-600">admin123</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">Student Account</p>
                  <p className="text-sm text-gray-600">john.doe@example.edu</p>
                  <p className="text-sm text-gray-600">student123</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500">Development Status: Sprint 1 Complete ✅</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}