'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WeeklyCheckInPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [progressSummary, setProgressSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [confidenceLevel, setConfidence] = useState(3);
  const [completionPercentage, setCompletion] = useState(50);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if check-in already exists this week
  useEffect(() => {
    if (!token || !projectId) return;

    fetch(`/api/Projects/${projectId}/check-ins`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.alreadyCheckedInThisWeek) {
          router.replace('/employee');
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [token, projectId, router]);

  const handleSubmit = async () => {
  setError('');
  setSuccess('');

  if (!progressSummary.trim()) {
    setError('Progress summary is required.');
    return;
  }

  if (confidenceLevel < 1 || confidenceLevel > 5) {
    setError('Confidence level must be between 1 and 5.');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectId,
        progressSummary,
        blockers,
        confidenceLevel: Number(confidenceLevel),       
        completionPercentage: Number(completionPercentage),  
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.error || 'Failed to submit check-in');
      return;
    }

    setSuccess('Check-in submitted successfully.');
    setTimeout(() => router.push('/employee'), 1200);
  } catch {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};


  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
        
      <div className="max-w-10/11 mx-auto">
         <button
          onClick={() => router.back()}
          className="px-4 py-2 mb-3 text-sm border border-gray-800 rounded-lg text-gray-800 hover:bg-gray-800 hover:text-white transition"
        >
         ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Weekly Project Check-In
        </h1>

        {error && (
          <div className="mb-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 border border-green-300 bg-green-50 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Progress Summary */}
          <div>
            <label className="block font-medium text-gray-900 mb-1">
              Progress Summary
            </label>
            <textarea
              value={progressSummary}
              onChange={(e) => setProgressSummary(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="What did you work on this week?"
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="block font-medium text-gray-900 mb-1">
              Blockers / Challenges
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Any issues slowing you down?"
            />
          </div>

          {/* Confidence */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Confidence Level: <strong>{confidenceLevel}</strong>/5
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={confidenceLevel}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Completion */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Completion Percentage: <strong>{completionPercentage}%</strong>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={completionPercentage}
              onChange={(e) => setCompletion(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit Weekly Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
}
