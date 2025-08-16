'use client';

import React from 'react';
import { NavigationProvider } from '@leas-academy/shared';
import { UniversalNavbar } from '@leas-academy/ui/components/navigation';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <NavigationProvider>
      <div className="h-screen flex bg-platinum-50">
        {/* Universal Sidebar Navigation */}
        <div className="w-80 flex-shrink-0">
          <UniversalNavbar variant="side" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader title={title} subtitle={subtitle} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}
