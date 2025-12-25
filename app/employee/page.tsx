'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  _id: string;
  name: string;
  status: 'On Track' | 'At Risk' | 'Critical' | 'Completed';
  startDate: string;
  endDate: string;
  openRisks: number;
  hasCheckedInThisWeek: boolean;
}

interface DashboardResponse {
  success: boolean;
  stats: {
    totalProjects: number;
    pendingCheckIns: number;
  };
  projects: Project[];
}

export default function EmployeeDashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/employee/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: DashboardResponse = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data as any);
        }

        setProjects(data.projects);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-b-2 border-gray-900 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Employee Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Your assigned projects & weekly responsibilities
        </p>
      </div>

      {/* Projects Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No assigned projects
          </div>
        )}

        {projects.map((project) => (
          <div
            key={project._id}
            className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white"
          >
            {/* Project Title */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h2>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'On Track'
                    ? 'bg-green-100 text-green-700'
                    : project.status === 'At Risk'
                    ? 'bg-yellow-100 text-yellow-800'
                    : project.status === 'Critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {project.status}
              </span>
            </div>

            {/* Risks */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Open Risks</span>
              <span
                className={`text-sm font-semibold ${
                  project.openRisks > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {project.openRisks}
              </span>
            </div>

            {/* Check-in Status */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm text-gray-600">Weekly Check-in</span>
              {project.hasCheckedInThisWeek ? (
                <span className="text-green-600 font-medium text-sm">
                  Submitted
                </span>
              ) : (
                <span className="text-red-600 font-medium text-sm">
                  Pending
                </span>
              )}
            </div>

            {/* Action */}
            <button
              onClick={() =>
                router.push(`/employee/projects/${project._id}/check-in`)
              }
              className="w-full py-2.5 rounded-lg font-semibold text-sm
                border border-gray-900 text-gray-900
                hover:bg-gray-900 hover:text-white transition"
            >
              Submit Check-in
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
