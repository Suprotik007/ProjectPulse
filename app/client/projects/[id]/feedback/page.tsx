'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Feedback = {
  _id: string;
  weekStartDate: string;
  satisfactionRating: number;
  communicationRating: number;
  comments?: string;
  issueFlagged: boolean;
};

export default function ClientFeedbackPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const { token } = useAuth();

  const [history, setHistory] = useState<Feedback[]>([]);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [satisfaction, setSatisfaction] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [comments, setComments] = useState('');
  const [issueFlagged, setIssueFlagged] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch feedback history
  useEffect(() => {
    if (!token || !projectId) return;

    fetch(`/api/Projects/${projectId}/feedback`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.feedback) return;

        setHistory(data.feedback);

        // Check if already submitted this week
        const currentMonday = new Date();
        const day = currentMonday.getDay();
        const diff =
          currentMonday.getDate() - day + (day === 0 ? -6 : 1);
        currentMonday.setDate(diff);
        currentMonday.setHours(0, 0, 0, 0);

        const exists = data.feedback.some(
          (f: Feedback) =>
            new Date(f.weekStartDate).getTime() ===
            currentMonday.getTime()
        );

        setAlreadySubmitted(exists);
      })
      .catch(() => {});
  }, [token, projectId]);

  const submitFeedback = async () => {
    setError('');
    setSuccess('');

    if (alreadySubmitted) {
      setError('Feedback already submitted for this week.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          satisfactionRating: satisfaction,
          communicationRating: communication,
          comments,
          issueFlagged,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Submission failed');
        return;
      }

      setSuccess('Feedback submitted successfully.');
      setAlreadySubmitted(true);

      setTimeout(() => router.push('/client'), 1200);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-white px-4 py-8">
      <div className="max-w-10/11 lg:max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 text-sm border text-gray-800 border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Weekly Project Feedback
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded">
            {success}
          </div>
        )}

        {!alreadySubmitted && (
          <div className="space-y-6 mb-10">
            {/* Satisfaction */}
            <div>
              <label className="font-medium text-gray-900">
                Satisfaction Rating: {satisfaction}/5
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={satisfaction}
                onChange={e => setSatisfaction(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Communication */}
            <div>
              <label className="font-medium text-gray-900">
                Communication Rating: {communication}/5
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={communication}
                onChange={e => setCommunication(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="font-medium text-gray-900">
                Comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={4}
                className="w-full border-2 text-gray-800 border-gray-300 rounded-lg p-3"
              />
            </div>

            {/* Flag */}
            <label className="flex items-center gap-2 text-gray-900">
              <input
                type="checkbox"
                checked={issueFlagged}
                onChange={e => setIssueFlagged(e.target.checked)}
              />
              Flag an issue
            </label>

            <button
              onClick={submitFeedback}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {/* Feedback history */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Previous Feedback
        </h2>

        <div className="space-y-4 text-gray-800">
          {history.map(f => (
            <div
              key={f._id}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="text-sm text-gray-600 mb-1">
                Week of{' '}
                {new Date(f.weekStartDate).toLocaleDateString()}
              </div>
              <div className="text-gray-900">
                Satisfaction: {f.satisfactionRating}/5 • Communication:{' '}
                {f.communicationRating}/5
              </div>
              {f.comments && (
                <p className="text-gray-700 mt-2">{f.comments}</p>
              )}
              {f.issueFlagged && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Issue Flagged
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
