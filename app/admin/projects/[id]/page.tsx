'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';


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

export default function ProjectDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [data, setData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (token && projectId) fetchProjectDetails();
  }, [token, projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/Projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (response.ok) setData(result);
      else setError(result.error || 'Failed to fetch project details');
    } catch (err) {
      setError('Failed to fetch project details');
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/Projects/${projectId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) router.push('/admin/projects');
      else alert('Failed to delete project');
    } catch { alert('Error deleting project'); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800';
      case 'At Risk': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getHealthColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const getSeverityColor = (severity: string) => severity === 'High' ? 'bg-red-100 text-red-800' : severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatDateTime = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading project details...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="bg-red-50 border border-red-400 text-red-800 px-6 py-4 rounded-lg max-w-md mx-auto mt-6">
      <p className="font-semibold">Error</p>
      <p className="text-sm mt-1">{error}</p>
      <button onClick={() => router.back()} className="mt-3 text-sm underline hover:no-underline">Go Back</button>
    </div>
  );

  const { project, recentCheckIns, recentFeedback, risks, stats } = data;

  return (
    <div className="space-y-6 p-4 md:p-8 bg-white min-h-screen">
      {/* Header */}
      <div>
            <button onClick={() => router.back()} className="  border p-2 rounded-xl bg-gray-900 mb-4 flex items-center gap-2 text-sm font-medium">← Back to Projects</button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link href={`/admin/projects/${projectId}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">Edit Project</Link>
            <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">Delete</button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-b-4 border-blue-600">
          <p className="text-sm text-gray-600   font-medium mb-1">Health Score</p>
          <p className={`text-3xl font-bold ${getHealthColor(project.healthScore)}`}>{project.healthScore}%</p>
        </div>
        <div className="bg-white border-l-4 border-b-4 border-teal-600 rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Check-ins</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCheckIns}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border-l-4 border-b-4 border-yellow-400 p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Feedback</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalFeedback}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border-l-4 border-b-4 border-red-500 p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Open Risks</p>
          <p className="text-3xl font-bold text-red-600">{stats.openRisks}</p>
        </div>
      </div>

      {/* Project Info & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm  text-gray-500">Timeline</p>
              <p className="text-gray-900 font-medium">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="text-gray-900 font-medium">{project.clientId.name}</p>
              <p className="text-sm text-gray-600">{project.clientId.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900">{formatDate(project.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-gray-900">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members ({project.employeeIds.length})</h2>
          {project.employeeIds.length === 0 ? (
            <p className="text-gray-500 text-sm">No team members assigned yet</p>
          ) : (
            <div className="space-y-3">
              {project.employeeIds.map(emp => (
                <div key={emp._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200 hover:shadow-sm transition">
                  <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-semibold">{emp.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-600">{emp.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 border border-gray-600 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete `{project.name}`? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-800 rounded-lg text-gray-900  hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
