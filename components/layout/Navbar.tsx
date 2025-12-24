'use client';

import React from 'react';
import Link from 'next/link';
import { FaFolderPlus } from 'react-icons/fa6';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

 
  if (!user) return null;

  return (
    <nav className="bg-white sticky top-0 text-gray-900 shadow-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold flex gap-3 items-center text-primary-600"
          >
            <FaFolderPlus />
            <span>ProjectPulse</span>
          </Link>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right text-sm sm:block hidden">
              <p className="font-semibold text-gray-900">
                {user.email}
              </p>
              <p className="text-gray-500">
                {user.role}
              </p>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
