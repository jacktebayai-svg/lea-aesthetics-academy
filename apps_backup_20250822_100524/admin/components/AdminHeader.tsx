'use client';

import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-platinum-200 shadow-subtle">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl font-elegant font-semibold text-primary-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-silver-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-80 px-4 py-2 pl-10 bg-platinum-50 border border-platinum-200 rounded-xl text-sm text-primary-900 placeholder-silver-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-silver-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-silver-600 hover:text-primary-900 hover:bg-platinum-100 rounded-xl transition-colors duration-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zm-7-3h7v-3H8v3zm0-6h7V5H8v3z" />
              </svg>
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white"></span>
            </button>

            {/* Quick Actions */}
            <button className="px-4 py-2 bg-gradient-to-r from-primary-900 to-silver-800 text-white text-sm font-medium rounded-xl hover:shadow-elegant transform hover:scale-105 transition-all duration-200">
              Quick Add
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-platinum-100 transition-colors duration-200">
                <div className="w-8 h-8 bg-gradient-to-br from-silver-400 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">LA</span>
                </div>
                <svg className="h-4 w-4 text-silver-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
