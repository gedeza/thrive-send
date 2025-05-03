import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">ThriveSend</div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/calendar"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Calendar
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6 sm:text-5xl">
            Welcome to ThriveSend
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            The comprehensive social media management platform for digital agencies,
            consultants, and service providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-base font-medium inline-block"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/calendar"
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium inline-block"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} ThriveSend. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
