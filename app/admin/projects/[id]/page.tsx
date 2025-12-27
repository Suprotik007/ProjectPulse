'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ActivityTimeline from '@/components/ActivityTimeline';

/* =======================
   Types
======================= */

interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  healthScore: number;
  startDate: string;
  endDate: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  employeeIds: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CheckIn {
  _id: string;
  employeeId: { name: string };
  progressSummary: string;
  confidenceLevel: number;
  completionPercentage: number;
  createdAt: string;
}

interface Feedback {
  _id: string;
  clientId: { name: string };
  satisfactionRating: number;
  communicationRating: number;
  comments: string;
  issueFlagged: boolean;
  createdAt: string;
}

interface Risk {
  _id: string;
  employeeId: { name: string };
  title: string;
  severity: string;
  mitigationPlan: string;
  status: string;
  createdAt: string;
}

interface ProjectData {
  project: Project;
  recentCheckIns: CheckIn[];
  recentFeedback: Feedback[];
  risks: Risk[];
  stats: {
    totalCheckIns: number;
    totalFeedback: number;
    openRisks: number;
    totalRisks: number;
  };
}

/* =======================
   Page
======================= */

export default function ProjectDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [data, setData] = useState<ProjectData | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* =======================
     Fetching
  ======================= */

  useEffect(() => {
    if (token && projectId) {
      fetchProjectDetails();
      fetchTimeline();
    }
  }, [token, projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/Projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
    } catch {
      setError('Failed to fetch project details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/Projects/${projectId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Timeline error');
      const result = await response.json();
      setTimeline(result.timeline || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/Projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) router.push('/admin/projects');
      else alert('Failed to delete project');
    } catch {
      alert('Error deleting project');
    }
  };

  /* =======================
     Helpers
  ======================= */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800';
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-slate-200 text-slate-800';
      default:
        return 'bg-slate-200 text-slate-800';
    }
  };

  const getHealthColor = (score: number) =>
    score >= 80
      ? 'text-green-600'
      : score >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  /* =======================
     Loading / Error
  ======================= */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-slate-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-50 border border-red-300 p-6 rounded-xl">
        <p className="font-semibold text-red-700">Error</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-3 underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const { project, stats } = data;

  /* =======================
     Render
  ======================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-10 md:py-8 space-y-10">
      {/* Header */}
      <div className="bg-white border-2 border-gray-400 rounded-xl p-6 shadow-sm">
        <button
          onClick={() => router.push('/admin/projects')}
          className="mb-4 text-sm border p-2 bg-gray-800 rounded-xl text-slate-100 hover:underline"
        >
          ← Back to Projects
        </button>

        <div className="flex  flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold text-slate-900">
                {project.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-2 text-slate-600 max-w-3xl">
              {project.description}
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <Link
              href={`/admin/projects/${projectId}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg text-sm font-medium shadow"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition text-white rounded-lg text-sm font-medium shadow"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Health', value: `${project.healthScore}%`, color: getHealthColor(project.healthScore) },
          { label: 'Check-ins', value: stats.totalCheckIns, color: 'text-teal-600' },
          { label: 'Feedback', value: stats.totalFeedback, color: 'text-purple-600' },
          { label: 'Open Risks', value: stats.openRisks, color: 'text-red-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border-2 border-gray-400  rounded-xl p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500 uppercase tracking-wide">
              {item.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${item.color || ''}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-gray-400  rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Project Information
          </h2>
          <div className="space-y-3 text-sm text-sky-500">
            <p >
              <span className="text-gray-500 font-medium">Timeline:</span>{' '}
              {formatDate(project.startDate)} → {formatDate(project.endDate)}
            </p>
            <p>
              <span className="text-slate-500 font-medium">Client:</span>{' '}
              {project.clientId.name}
            </p>
            <p>
              <span className="text-slate-500 font-medium">Email:</span>{' '}
              {project.clientId.email}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-400  rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Team Members ({project.employeeIds.length})
          </h2>
          <div className="space-y-3">
            {project.employeeIds.map((emp) => (
              <div
                key={emp._id}
                className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-gray-400  rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {emp.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {emp.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border-2 border-gray-400  rounded-xl p-6 shadow-sm">
        <ActivityTimeline items={timeline} viewerRole="Admin" />
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Project?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-500 text-gray-700 rounded-lg py-2 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 transition text-white rounded-lg py-2 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
