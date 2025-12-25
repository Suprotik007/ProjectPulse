'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Project = {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  lastFeedbackDate: string | null;
};

function statusColor(status: string) {
  switch (status) {
    case 'On Track':
      return 'bg-green-100 text-green-800';
    case 'At Risk':
      return 'bg-yellow-100 text-yellow-800';
    case 'Critical':
      return 'bg-red-100 text-red-800';
    case 'Completed':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function ClientDashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    fetch('/api/client/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load dashboard');
        setProjects(data.projects || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-6xl  mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Client Dashboard
        </h1>

        {error && (
          <div className="mb-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <p className="text-gray-600">No projects assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border-2 border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${statusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Health Score:</strong>{' '}
                    <span className="font-semibold">
                      {project.healthScore}%
                    </span>
                  </p>

                  <p>
                    <strong>Last Feedback:</strong>{' '}
                    {project.lastFeedbackDate
                      ? new Date(project.lastFeedbackDate).toLocaleDateString()
                      : 'Not submitted yet'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(`/client/projects/${project.id}/feedback`)
                  }
                  className="mt-4 w-full border border-gray-900 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition"
                >
                  Submit Feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
