'use client';

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div>
       <Navbar userRole={user?.role} userName={user?.name} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Client Dashboard
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 mb-4">
          You're logged in as a <span className="font-semibold text-primary-600">Client</span>.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-semibold text-primary-900">My Projects</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
          </div>
          
          <div className="bg-success-light border border-success rounded-lg p-4">
            <h3 className="font-semibold text-success-dark">Projects On Track</h3>
            <p className="text-3xl font-bold text-success mt-2">0</p>
          </div>
        </div>
       
      </div>
    </div>
  );
}