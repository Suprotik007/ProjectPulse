'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaFolderPlus } from 'react-icons/fa6';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth();
  const router = useRouter();

  // ✅ Redirect belongs in useEffect
  useEffect(() => {
    if (!user) return;

    const roleRoutes: Record<string, string> = {
      Admin: '/admin/projects',
      Employee: '/employee',
      Client: '/client',
    };

    router.replace(roleRoutes[user.role]);
  }, [user, router]);

  // While redirecting
  if (user) {
    return <p>Loading Data...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-3 text-4xl text-black font-bold mb-2">
            <FaFolderPlus />
            <span>ProjectPulse</span>
          </div>
          <p className="text-gray-800 font-semibold">
            Project Health & Client Feedback Tracker
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-gray-300 rounded-lg border-2 shadow-lg p-8">
          <h2 className="text-3xl border-b-2 border-gray-800 pb-5 text-center font-bold text-gray-900 mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@projectpulse.com"
              className="w-full px-4 py-2 border border-gray-500 rounded-lg"
            />

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-500 rounded-lg"
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-2 rounded-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
