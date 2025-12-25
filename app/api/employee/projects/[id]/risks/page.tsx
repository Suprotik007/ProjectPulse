'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Risk = {
  _id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High';
  mitigationPlan: string;
  status: 'Open' | 'Resolved';
};

export default function ProjectRisksPage() {
  const { id: projectId } = useParams();
  const { token } = useAuth();

  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/risks?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch risks');
      setRisks(data.risks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && token) fetchRisks();
  }, [projectId, token]);

  const handleAddRisk = async () => {
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, title, severity, mitigationPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add risk');

      setTitle('');
      setMitigationPlan('');
      setSeverity('Low');
      setRisks([data.risk, ...risks]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (riskId: string, currentStatus: 'Open' | 'Resolved') => {
    const newStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
    try {
      const res = await fetch(`/api/risks/${riskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setRisks((prev) =>
        prev.map((r) => (r._id === riskId ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Project Risks</h1>

        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">{error}</div>
        )}

        {/* Add Risk Form */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Add New Risk</h2>
          <input
            type="text"
            placeholder="Risk Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as 'Low' | 'Medium' | 'High')}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <textarea
            placeholder="Mitigation Plan (optional)"
            value={mitigationPlan}
            onChange={(e) => setMitigationPlan(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            onClick={handleAddRisk}
            disabled={submitting}
            className="bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Risk'}
          </button>
        </div>

        {/* Risks List */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-gray-900 rounded-full" />
          </div>
        ) : risks.length === 0 ? (
          <p className="text-gray-700">No risks reported for this project.</p>
        ) : (
          <div className="space-y-4">
            {risks.map((risk) => (
              <div
                key={risk._id}
                className={`p-4 rounded-lg border flex justify-between items-start ${getSeverityColor(
                  risk.severity
                )}`}
              >
                <div>
                  <h3 className="font-semibold">{risk.title}</h3>
                  <p className="text-sm">{risk.mitigationPlan}</p>
                  <p className="text-xs mt-1">
                    Status: <strong>{risk.status}</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(risk._id, risk.status)}
                  className="ml-4 py-1 px-3 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
                >
                  {risk.status === 'Open' ? 'Mark Resolved' : 'Reopen'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
