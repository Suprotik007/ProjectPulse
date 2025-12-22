'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Navbar  userRole={user?.role}  userName={user?.name} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome, {user?.name}!
        </h2>

        <p className="text-gray-700 mb-6">
          You're logged in as an{' '}
          <span className="font-semibold text-blue-600">
            Administrator
          </span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900">On Track</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900">At Risk</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
