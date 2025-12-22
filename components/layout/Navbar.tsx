'use client';

import React from 'react';
import Link from 'next/link';
import { FaFolderPlus } from 'react-icons/fa6';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  userRole?: 'Admin' | 'Employee' | 'Client';
  userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const { logout } = useAuth();

  return (
    <nav className="bg-white text-gray-900 shadow-sm border-b">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold flex gap-3 text-primary-600">
              <FaFolderPlus />
              <span>ProjectPulse</span>
            </Link>
          </div>
          
          {userName && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{userName}</p>
                <p className="text-gray-500">{userRole}</p>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}