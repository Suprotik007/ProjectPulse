'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} userName={user?.name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Employee Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Overview of your work, tasks, and responsibilities
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white border-green-400 rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-primary-600 text-gray-800 mb-10">
          <h2 className="text-2xl font-semibold">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-primary-100">
            Role: <span className="font-medium">Employee</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Assigned Projects */}
          <div className="bg-white border-blue-400 rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-primary-600">
            <h3 className="text-gray-500 font-medium">
              Assigned Projects
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500 mt-2">
              Projects currently assigned to you
            </p>
          </div>

          {/* Pending Check-ins */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-yellow-500">
            <h3 className="text-gray-500 font-medium">
              Pending Check-ins
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500 mt-2">
              Updates awaiting your response
            </p>
          </div>

          {/* Open Risks */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-red-500">
            <h3 className="text-gray-500 font-medium">
              Open Risks
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500 mt-2">
              Issues that need attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
