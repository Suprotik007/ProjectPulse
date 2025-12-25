'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Employee' | 'Client';
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load users');
        return;
      }

      setUsers(data.users);
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: 'Client' | 'Employee') => {
    try {
      setUpdatingId(userId);

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update role');
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="border border-red-300 bg-red-50 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm border border-gray-800 rounded-lg text-gray-800 hover:bg-gray-800 hover:text-white transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-2 border-gray-400 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Role
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'Employee'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.role !== 'Admin' && (
                    <button
                      disabled={updatingId === user._id}
                      onClick={() =>
                        changeRole(
                          user._id,
                          user.role === 'Client' ? 'Employee' : 'Client'
                        )
                      }
                      className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
                        user.role === 'Client'
                          ? 'border-blue-600 text-blue-600 hover:bg-blue-50'
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                      } disabled:opacity-50`}
                    >
                      {updatingId === user._id
                        ? 'Updating...'
                        : user.role === 'Client'
                        ? 'Make Employee'
                        : 'Make Client'}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
