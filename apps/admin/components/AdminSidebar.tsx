'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  {
    category: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Analytics', href: '/analytics', icon: '📈' },
    ]
  },
  {
    category: 'Practice Management',
    items: [
      { name: 'Appointments', href: '/appointments', icon: '📅' },
      { name: 'Clients', href: '/clients', icon: '👥' },
      { name: 'Practitioners', href: '/practitioners', icon: '👩‍⚕️' },
      { name: 'Services', href: '/services', icon: '💆‍♀️' },
      { name: 'Treatments', href: '/treatments', icon: '✨' },
    ]
  },
  {
    category: 'Learning Management',
    items: [
      { name: 'Courses', href: '/courses', icon: '📚' },
      { name: 'Students', href: '/students', icon: '🎓' },
      { name: 'Enrollments', href: '/enrollments', icon: '📋' },
      { name: 'Certificates', href: '/certificates', icon: '🏆' },
      { name: 'Assessments', href: '/assessments', icon: '📝' },
    ]
  },
  {
    category: 'Business',
    items: [
      { name: 'Payments', href: '/payments', icon: '💳' },
      { name: 'Invoices', href: '/invoices', icon: '🧾' },
      { name: 'Reports', href: '/reports', icon: '📊' },
      { name: 'Documents', href: '/documents', icon: '📄' },
    ]
  },
  {
    category: 'System',
    items: [
      { name: 'Settings', href: '/settings', icon: '⚙️' },
      { name: 'Users', href: '/users', icon: '👤' },
      { name: 'Templates', href: '/dashboard/templates', icon: '📋' },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full bg-gradient-to-b from-white via-platinum-50 to-silver-100 border-r border-platinum-200 shadow-elegant">
      {/* Logo Section */}
      <div className="p-6 border-b border-platinum-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-silver-700 rounded-xl flex items-center justify-center shadow-elegant">
            <span className="text-white font-serif text-lg">L</span>
          </div>
          <div>
            <h1 className="text-lg font-elegant font-semibold text-primary-900">
              LEA Aesthetics
            </h1>
            <p className="text-sm text-silver-600">Academy Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {sidebarItems.map((category) => (
          <div key={category.category}>
            <h3 className="px-3 mb-3 text-xs font-semibold text-silver-700 uppercase tracking-wider">
              {category.category}
            </h3>
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-900 to-silver-800 text-white shadow-elegant transform scale-105'
                        : 'text-silver-700 hover:bg-white hover:text-primary-900 hover:shadow-subtle hover:transform hover:scale-102'
                      }
                    `}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-platinum-300 rounded-full animate-pulse-elegant"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-platinum-200">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-subtle hover:shadow-elegant transition-all duration-300">
          <div className="w-10 h-10 bg-gradient-to-br from-silver-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">LA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary-900 truncate">
              Lea Anderson
            </p>
            <p className="text-xs text-silver-600 truncate">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
