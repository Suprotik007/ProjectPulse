'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function CreateProjectPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientId: '',
    employeeIds: [] as string[],
  });

  const [clients, setClients] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const [clientsRes, employeesRes] = await Promise.all([
        fetch('/api/users?role=Client', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch('/api/users?role=Employee', { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
      ]);

      const clientsData = await clientsRes.json();
      const employeesData = await employeesRes.json();

      if (clientsRes.ok) setClients(clientsData.users || []);
      if (employeesRes.ok) setEmployees(employeesData.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/Projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        router.push('/admin/projects');
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Create project error:', err);
      setError('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(id)
        ? prev.employeeIds.filter((x) => x !== id)
        : [...prev.employeeIds, id],
    }));
  };

  return (
  <div className="min-h-screen bg-white py-10 px-4">
    <div className="max-w-xl mx-auto">
      
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-900 border border-black rounded p-2 hover:bg-gray-800 hover:text-gray-100  mb-4"
        >
          ← Back to Projects
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Create New Project
        </h1>

        <p className="text-gray-600 mt-2 max-w-2xl">
          Create a project, assign a client, and optionally add team members.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border-2 border-gray-700 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="divide-y">

          {/* Project Info */}
          <section className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Project Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700   mb-1">
                Project Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-700 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-700 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="rounded-lg border border-gray-700 px-4 py-3 text-gray-900"
              />

              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="rounded-lg border border-gray-700 px-4 py-3 text-gray-900"
              />
            </div>
          </section>

          {/* Client */}
          <section className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Client
            </h2>

            <select
              required
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className="w-full rounded-lg border border-gray-700 px-4 py-3 bg-white text-gray-900"
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.email}
                </option>
              ))}
            </select>
          </section>

          {/* Team */}
          <section className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members
            </h2>

            {isLoadingUsers ? (
              <p className="text-gray-500">Loading team members...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {employees.map((e) => (
                  <label
                    key={e._id}
                    className="flex items-center gap-3 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.employeeIds.includes(e._id)}
                      onChange={() => handleEmployeeToggle(e._id)}
                      className="h-4 w-4 border-2 border-gray-700 rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {e.name}
                      </p>
                      <p className="text-xs text-gray-500">{e.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Actions */}
          <section className="p-6 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 border rounded-lg text-red-500 hover:bg-red-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 border text-green-600 rounded-lg hover:bg-green-300 hover:text-green-700 disabled:opacity-50"
            >
              Create Project
            </button>
          </section>

        </form>
      </div>
    </div>
  </div>
);

}