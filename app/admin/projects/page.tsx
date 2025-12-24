'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  healthScore: number;
  clientId: { name: string; email: string };
  employeeIds: Array<{ name: string }>;
  startDate: string;
  endDate: string;
}

export default function AdminProjectsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.push('/');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setProjects(Object.values(data.projectsByStatus).flat() as Project[]);
        } else {
          setError(data.error || 'Failed to fetch projects');
        }
      } catch (err) {
        console.error('Fetch projects error:', err);
        setError('Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchProjects();
  }, [token, user, authLoading, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800';
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white  md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1 text-lg">Manage all projects in the system by Admin</p>
        </div>
        <Link
          href="/admin/projects/create"
          className="bg-gray-700 px-6 py-3 rounded-lg shadow-md hover:bg-primary-700 transition font-semibold"
        >
          + Create Project
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-5 py-4 rounded-lg mb-6">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* No projects */}
      {projects?.length === 0 && !error ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No projects found</p>
          <Link
            href="/admin/projects/create"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-50 border-2  rounded-xl shadow-md hover:shadow-xl transition p-6 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex-1">{project.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

              {/* Health Score */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Health Score</span>
                  <span className="text-sm font-semibold text-gray-900">{project.healthScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getHealthScoreColor(project.healthScore)}`}
                    style={{ width: `${project.healthScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Client & Team */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">{project.clientId.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Team</p>
                  <p className="text-sm font-medium text-gray-900">{project.employeeIds.length} member(s)</p>
                </div>
              </div>

              {/* Dates */}
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <div>
                  <span className="block font-semibold">Start:</span>
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block font-semibold">End:</span>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <Link
                  href={`/api/projects/${project._id}`}
                  className="flex-1 text-center text-gray-800 border-gray-800 border px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition font-medium"
                >
                  View
                </Link>
                <Link
                  href={`/admin/projects/${project._id}/edit`}
                  className="flex-1 text-center text-gray-800 border-gray-800 border px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
