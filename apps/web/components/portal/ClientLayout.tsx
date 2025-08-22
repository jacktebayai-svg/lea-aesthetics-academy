'use client';

import React from 'react';
import UniversalNavbar from '@/lib/ui/components/navigation/UniversalNavbar';

// Simple NavigationProvider mock for demo purposes
const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavbar?: boolean;
  variant?: 'page' | 'app';
}

export default function ClientLayout({ 
  children, 
  title, 
  showNavbar = true,
  variant = 'app' 
}: ClientLayoutProps) {
  if (variant === 'page') {
    // Simple page layout with top navigation
    return (
      <NavigationProvider>
        <div className="min-h-screen bg-platinum-50">
          {showNavbar && <UniversalNavbar variant="top" />}
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {title && (
              <div className="mb-8">
                <h1 className="text-3xl font-elegant font-semibold text-primary-900">
                  {title}
                </h1>
              </div>
            )}
            {children}
          </main>
        </div>
      </NavigationProvider>
    );
  }

  // Full app layout with side navigation
  return (
    <NavigationProvider>
      <div className="h-screen flex bg-platinum-50">
        {/* Universal Sidebar Navigation */}
        {showNavbar && (
          <div className="w-80 flex-shrink-0">
            <UniversalNavbar variant="side" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          {title && (
            <header className="bg-white border-b border-platinum-200 shadow-subtle">
              <div className="px-6 py-4">
                <h1 className="text-2xl font-elegant font-semibold text-primary-900">
                  {title}
                </h1>
              </div>
            </header>
          )}

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
