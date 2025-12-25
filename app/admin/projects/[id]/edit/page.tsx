'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
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
}

export default function EditProjectPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'On Track',
    clientId: '',
    employeeIds: [] as string[],
  });

  const [clients, setClients] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && projectId) {
      fetchProjectAndUsers();
    }
  }, [token, projectId]);

  const fetchProjectAndUsers = async () => {
    setIsLoadingData(true);
    try {
      // Fetch project details, clients, and employees in parallel
      const [projectRes, clientsRes, employeesRes] = await Promise.all([
        fetch(`/api/Projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/users?role=Client', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/users?role=Employee', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const projectData = await projectRes.json();
      const clientsData = await clientsRes.json();
      const employeesData = await employeesRes.json();

      if (projectRes.ok && projectData.project) {
        const project: Project = projectData.project;
        
        // Pre-fill form with project data
        setFormData({
          name: project.name,
          description: project.description,
          startDate: project.startDate.split('T')[0], // Format: YYYY-MM-DD
          endDate: project.endDate.split('T')[0],
          status: project.status,
          clientId: project.clientId._id,
          employeeIds: project.employeeIds.map((emp) => emp._id),
        });
      } else {
        setError('Failed to load project');
      }

      if (clientsRes.ok) setClients(clientsData.users || []);
      if (employeesRes.ok) setEmployees(employeesData.users || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load project data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate dates
  if (new Date(formData.endDate) <= new Date(formData.startDate)) {
    setError('End date must be after start date');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const res = await fetch(`/api/Projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) router.push(`/admin/projects/${projectId}`);
    else setError(data.error || 'Failed to update project');
  } catch (err) {
    console.error('Update project error:', err);
    setError('Failed to update project');
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

  const getSelectedClient = () => {
    return clients.find((c) => c._id === formData.clientId);
  };

  const getSelectedEmployees = () => {
    return employees.filter((e) => formData.employeeIds.includes(e._id));
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white '> 
        <div className=" max-w-10/11  md:max-w-xl  py-8 bg-white mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/admin/projects/${projectId}`)}
          className=" border p-2 rounded-xl bg-gray-900 mb-4 flex items-center gap-2 text-sm font-medium"
        >
          ← Back to Project Details
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-600 mt-2">Update project details and team assignments</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-400 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g., E-commerce Platform Redesign"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Project Description *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project goals, scope, and key deliverables..."
              className="w-full px-4 py-3 border-2 border-gray-400  rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Dates and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-400  rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                End Date *
              </label>
             <input
  type="date"
  required
  value={formData.endDate}
  min={formData.startDate} 
  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
       className="w-full px-4 py-3 border-2 border-gray-400  rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
/>

            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Project Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-400  rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Critical">Critical</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Status Badge Preview */}
          <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-400 ">
            <p className="text-xs text-gray-600 mb-2">Status Preview:</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                formData.status === 'On Track'
                  ? 'bg-purple-500'
                  : formData.status === 'At Risk'
                  ? 'bg-yellow-500 text-black'
                  : formData.status === 'Critical'
                  ? 'bg-red-500'
                  : 'bg-green-500 '
              }`}
            >
              {formData.status}
            </span>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Select Client *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">-- Choose a client --</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            {formData.clientId && getSelectedClient() && (
              <div className="mt-3 p-3 bg-primary-50 border-2 border-sky-300 rounded-lg">
                <p className="text-sm font-medium text-gray-500">
                  Selected Client: {getSelectedClient()?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getSelectedClient()?.email}
                </p>
              </div>
            )}
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Assign Team Members (Optional)
            </label>
            {employees.length === 0 ? (
              <div className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg bg-gray-50 text-gray-500">
                No employees available
              </div>
            ) : (
              <>
                <div className="border-2 border-gray-400 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                  <div className="space-y-2">
                    {employees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition border border-transparent hover:border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.employeeIds.includes(employee._id)}
                          onChange={() => handleEmployeeToggle(employee._id)}
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                        {formData.employeeIds.includes(employee._id) && (
                          <span className="text-xs bg-primary-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                            Selected
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Selected Employees Summary */}
                {formData.employeeIds.length > 0 && (
                  <div className="mt-3 p-4 bg-gray-50 border-2 border-sky-300  rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                      Selected Team Members ({formData.employeeIds.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedEmployees().map((emp) => (
                        <span
                          key={emp._id}
                          className="inline-flex items-center gap-2 bg-white border border-success px-3 py-1 rounded-full text-xs font-medium text-gray-800"
                        >
                          {emp.name}
                          <button
                            type="button"
                            onClick={() => handleEmployeeToggle(emp._id)}
                            className="text-gray-500 hover:text-red-600 ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border- border-danger text-red-500 px-4 py-3 rounded-lg">
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-400">
            <button
              type="button"
              onClick={() => router.push(`/admin/projects/${projectId}`)}
              className="flex-1 px-6 py-3 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-700 hover:text-white font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 hover:bg-teal-200 border text-teal-500 rounded-lg hover:bg-primary-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                '✓ Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Warning Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Note:</strong> Changing the project status or dates may affect health score
          calculations and reporting.
        </p>
      </div>
    </div>
    </div>
  );
}