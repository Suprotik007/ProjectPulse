'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FaFolderPlus } from "react-icons/fa6";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (user) {
    const roleRoutes = {
      Admin: '/admin',
      Employee: '/employee',
      Client: '/client',
    };
    router.replace(roleRoutes[user.role]);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className=" mb-8">
            
          <div className="flex  gap-3 text-4xl text-black font-bold mb-2">
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
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm  text-gray-700 font-semibold mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@projectpulse.com"
                className="w-full px-4 py-2 border border-gray-500 text-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-700"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-danger-light border border-danger text-red px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 border-2 rounded-lg  border-gray-400">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@projectpulse.com / admin123</p>
              <p><strong>Employee:</strong> employee@projectpulse.com / emp123</p>
              <p><strong>Client:</strong> client@projectpulse.com / client123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center border p-1 text-sm text-red-500 mt-6">
          Internal System - No Public Registration
        </p>
      </div>
    </div>
  );
}