import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  userRole?: 'Admin' | 'Employee' | 'Client';
  userName?: string;
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  return (
    <nav className="bg-w shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ProjectPulse
            </Link>
          </div>
          
          {userName && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{userName}</p>
                <p className="text-gray-500">{userRole}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}