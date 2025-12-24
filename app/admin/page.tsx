'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Project {
  _id: string;
  name: string;
  status: string;
  healthScore: number;
  clientId?: { name: string };
}

interface DashboardData {
  summary: {
    totalProjects: number;
    onTrack: number;
    atRisk: number;
    critical: number;
    completed: number;
  };
  projectsMissingCheckIns: {
    _id: string;
    name: string;
    clientId?: { name: string };
  }[];
  highRiskProjects: {
    _id: string;
    name: string;
    status: string;
    healthScore: number;
  }[];
  projectsByStatus: {
    'On Track': Project[];
    'At Risk': Project[];
    'Critical': Project[];
    'Completed': Project[];
  };
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to load');
      setData(result);
    } catch (err) {
      setError('Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-red-300">
        <p className="font-semibold text-red-600">Error</p>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 text-sm text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-600">Welcome back, {user?.name}</p>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          ['Total Projects', data?.summary.totalProjects, '📊', 'border-violet-500'],
          ['On Track', data?.summary.onTrack, '✅', 'border-green-500'],
          ['At Risk', data?.summary.atRisk, '⚠️', 'border-yellow-500'],
          ['Critical', data?.summary.critical, '🚨', 'border-red-500'],
          ['Completed', data?.summary.completed, '🎉', 'border-gray-500'],
        ].map(([label, value, icon, border]) => (
          <div
            key={label as string}
            className={`bg-white rounded-xl border-l-4 ${border} border border-gray-200 p-5 shadow-sm hover:shadow-md transition`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {value ?? 0}
                </p>
              </div>
              <div className="text-3xl opacity-60">{icon}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Alerts */}
      <section className="grid grid-cols-1  lg:grid-cols-2 gap-6">
        {/* Missing Check-ins */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Missing Recent Check-ins
          </h2>

          {data?.projectsMissingCheckIns.length === 0 ? (
            <p className="text-sm text-gray-500">All projects are updated.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data?.projectsMissingCheckIns.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center p-4 rounded-lg border-2 border-yellow-500 hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900  ">{p.name}</p>
                    {p.clientId && (
                      <p className="text-sm text-gray-500">
                        Client: {p.clientId.name}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/admin/projects/${p._id}`}
                    className="text-sm font-medium border p-2 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Risk */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            High Risk Projects
          </h2>

          {data?.highRiskProjects.length === 0 ? (
            <p className="text-sm text-gray-500">No high-risk projects.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data?.highRiskProjects.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center p-4 rounded-lg border-2 border-red-300 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      Health: <span className="text-red-600 font-semibold">{p.healthScore}%</span>
                    </p>
                  </div>
                  <Link
                    href={`/admin/projects/${p._id}`}
                      className="text-sm font-medium border p-2 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white border-2 border-gray-300 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['Create Project', '/admin/projects/create', '➕'],
            ['View Projects', '/admin/projects', '📁'],
            ['Manage Users', '/admin/users', '👥'],
          ].map(([label, href, icon]) => (
            <Link
              key={label as string}
              href={href as string}
              className="group border-2 rounded-xl border-gray-200 p-6 text-center hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3 transition-transform group-hover:scale-105">
                {icon}
              </div>
              <p className="font-semibold text-gray-900">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
