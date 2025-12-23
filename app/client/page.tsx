'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} userName={user?.name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Client Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Track your projects and overall progress at a glance
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-linear-to-r border-l-4 border-b-4 border-green-400  text-gray-800 rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-2xl font-semibold">
            Welcome, {user?.name}
          </h2>
          <p className="mt-1 text-emerald-400">
            Account type: <span className="font-medium">Client</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Projects */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-primary-600 border-b-4 border-purple-400 ">
            <h3 className="text-gray-500 font-medium">
              My Projects
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500 mt-2">
              Total projects you’ve initiated
            </p>
          </div>

          {/* Projects On Track */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4  border-indigo-400">
            <h3 className="text-gray-500 font-medium">
              Projects On Track
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-3">0</p>
            <p className="text-sm text-gray-500 mt-2">
              Projects progressing as planned
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
