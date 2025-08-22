'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CrossAppNavigation from './CrossAppNavigation';

// Mock navigation hook for demo purposes
const useNavigation = () => {
  return {
    user: { name: 'Demo User', initials: 'DU', role: 'admin' as const },
    currentRole: 'admin' as const,
    navigationSections: [
      {
        name: 'Main',
        items: [
          { name: 'Dashboard', href: '/admin', icon: '📊', roles: ['admin'] },
          { name: 'Users', href: '/admin/users', icon: '👥', roles: ['admin'] },
          { name: 'Courses', href: '/admin/courses', icon: '📚', roles: ['admin'] }
        ],
        roles: ['admin']
      }
    ],
    quickAccess: [
      { name: 'Profile', href: '/profile', icon: '👤', roles: ['admin'] }
    ],
    appSwitcherItems: []
  };
};

interface UniversalNavbarProps {
  variant?: 'top' | 'side' | 'compact';
  className?: string;
}

export default function UniversalNavbar({ variant = 'top', className = '' }: UniversalNavbarProps) {
  const { user, currentRole, navigationSections, quickAccess, appSwitcherItems } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  if (!user || !currentRole) {
    return null;
  }

  // Role-specific styling
  const getRoleColors = () => {
    switch (currentRole) {
      case 'client':
        return 'from-blue-600 to-blue-700';
      case 'student':
        return 'from-green-600 to-green-700';
      case 'practitioner':
        return 'from-purple-600 to-purple-700';
      case 'tutor':
        return 'from-orange-600 to-orange-700';
      case 'admin':
      case 'manager':
      case 'owner':
      default:
        return 'from-primary-900 to-silver-800';
    }
  };

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'client':
        return 'Client Portal';
      case 'student':
        return 'Student Portal';
      case 'practitioner':
        return 'Practitioner Portal';
      case 'tutor':
        return 'Tutor Portal';
      case 'admin':
        return 'Admin Dashboard';
      case 'manager':
        return 'Manager Dashboard';
      case 'owner':
        return 'Owner Dashboard';
      default:
        return 'LEA Academy';
    }
  };

  if (variant === 'side') {
    return (
      <div className={`h-full bg-gradient-to-b from-white via-platinum-50 to-silver-100 border-r border-platinum-200 shadow-elegant ${className}`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-platinum-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColors()} rounded-xl flex items-center justify-center shadow-elegant`}>
              <span className="text-white font-elegant text-lg">L</span>
            </div>
            <div>
              <h1 className="text-lg font-elegant font-semibold text-primary-900">
                LEA Aesthetics
              </h1>
              <p className="text-sm text-silver-600">{getRoleLabel()}</p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-4 py-6 space-y-8">
          {navigationSections.map((section) => (
            <div key={section.name}>
              <h3 className="px-3 mb-3 text-xs font-semibold text-silver-700 uppercase tracking-wider">
                {section.name}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 text-silver-700 hover:bg-white hover:text-primary-900 hover:shadow-subtle hover:transform hover:scale-102"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-accent-500 text-white text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Cross-App Navigation */}
        <div className="px-4 pb-4">
          <CrossAppNavigation variant="buttons" className="w-full" />
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-platinum-200">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-subtle hover:shadow-elegant transition-all duration-300">
            <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColors()} rounded-full flex items-center justify-center`}>
              <span className="text-white text-sm font-semibold">{user.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-silver-600 truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Top navigation variant
  return (
    <nav className={`bg-white border-b border-platinum-200 shadow-elegant ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Role */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColors()} rounded-lg flex items-center justify-center shadow-elegant`}>
                <span className="text-white font-elegant text-sm">L</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-elegant font-semibold text-primary-900">
                  LEA Aesthetics
                </h1>
                <p className="text-xs text-silver-600 -mt-1">{getRoleLabel()}</p>
              </div>
            </Link>

            {/* Cross-App Navigation */}
            <CrossAppNavigation variant="dropdown" className="hidden sm:block" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {quickAccess.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-silver-700 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-silver-600 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3-3V9a6 6 0 10-12 0v5l-3 3h5a6 6 0 1012 0z" />
              </svg>
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColors()} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-semibold">{user.initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-primary-900">{user.name}</p>
                <p className="text-xs text-silver-600 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-silver-600 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-platinum-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationSections.map((section) => (
              <div key={section.name} className="py-2">
                <h4 className="px-3 text-xs font-semibold text-silver-700 uppercase tracking-wider mb-2">
                  {section.name}
                </h4>
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-silver-700 hover:text-primary-900 hover:bg-platinum-100 rounded-lg transition-colors duration-200"
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
