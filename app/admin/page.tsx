'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar userRole={user?.role} userName={user?.name} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            System-wide overview and operational status
          </p>
        </div>

        {/* Welcome / Role Card */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-2xl font-semibold">
            Welcome, {user?.name}
          </h2>
          <p className="mt-1 text-slate-300">
            Access level: <span className="font-medium">Administrator</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Projects */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-blue-600">
            <h3 className="text-slate-500 font-medium">
              Total Projects
            </h3>
            <p className="text-4xl font-bold text-slate-900 mt-3">0</p>
            <p className="text-sm text-slate-500 mt-2">
              All projects in the system
            </p>
          </div>

          {/* On Track */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-emerald-600">
            <h3 className="text-slate-500 font-medium">
              On Track
            </h3>
            <p className="text-4xl font-bold text-slate-900 mt-3">0</p>
            <p className="text-sm text-slate-500 mt-2">
              Projects meeting timelines
            </p>
          </div>

          {/* At Risk */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-b-4 border-red-600">
            <h3 className="text-slate-500 font-medium">
              At Risk
            </h3>
            <p className="text-4xl font-bold text-slate-900 mt-3">0</p>
            <p className="text-sm text-slate-500 mt-2">
              Projects requiring intervention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
