import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ProjectPulse
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Project Health & Client Feedback Tracker
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}