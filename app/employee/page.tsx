'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div>
       <Navbar  userRole={user?.role}  userName={user?.name} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Employee Dashboard
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 mb-4">
          You're logged in as an <span className="font-semibold text-primary-600">Employee</span>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-primary-900">Assigned Projects</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
          </div>
          
          <div className="bg-warning-light border border-warning rounded-lg p-4">
            <h3 className="font-semibold text-warning-dark">Pending Check-ins</h3>
            <p className="text-3xl font-bold text-warning mt-2">0</p>
          </div>
          
          <div className="bg-danger-light border border-danger rounded-lg p-4">
            <h3 className="font-semibold text-danger-dark">Open Risks</h3>
            <p className="text-3xl font-bold text-danger mt-2">0</p>
          </div>
        </div>
        
    
      </div>
    </div>
  );
}