'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-platinum-50 to-silver-100">
      {/* Header */}
      <header className="bg-white shadow-elegant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-900 to-silver-800 rounded-xl flex items-center justify-center shadow-elegant">
                <span className="text-white font-elegant text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-elegant font-semibold text-primary-900">
                  LEA Aesthetics Academy
                </h1>
                <p className="text-sm text-silver-600">Professional Aesthetic Training Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-elegant font-bold text-primary-900 mb-6">
            Welcome to LEA Aesthetics Academy
          </h2>
          <p className="text-xl text-silver-700 mb-8 max-w-3xl mx-auto">
            Your comprehensive platform for aesthetic training, client management, and professional development.
            Choose your portal below to get started.
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Portal */}
          <Link href="/client" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-2xl font-elegant font-semibold text-primary-900 mb-4">
                  Client Portal
                </h3>
                <p className="text-silver-600 mb-6">
                  Book appointments, view treatment history, and manage your aesthetic journey with our professional team.
                </p>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-100 transition-colors duration-200">
                  Access Client Dashboard →
                </div>
              </div>
            </div>
          </Link>

          {/* Student Portal */}
          <Link href="/student" className="group">
            <div className="bg-white rounded-2xl p-8 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="text-2xl font-elegant font-semibold text-primary-900 mb-4">
                  Student Portal
                </h3>
                <p className="text-silver-600 mb-6">
                  Access your courses, track progress, complete assignments, and advance your aesthetic education.
                </p>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-purple-100 transition-colors duration-200">
                  Access Learning Platform →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Additional Links */}
        <div className="text-center mt-16">
          <p className="text-silver-600 mb-4">Are you a practitioner or administrator?</p>
          <a 
            href="http://localhost:3001" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-primary-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-800 transition-colors duration-200 shadow-elegant"
          >
            <span>⚙️</span>
            <span>Access Admin Dashboard</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-elegant font-semibold text-center text-primary-900 mb-12">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">
                Comprehensive Learning
              </h4>
              <p className="text-silver-600">
                Industry-leading curriculum with hands-on training modules
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💆‍♀️</span>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">
                Client Management
              </h4>
              <p className="text-silver-600">
                Seamless booking and treatment tracking system
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="text-lg font-semibold text-primary-900 mb-2">
                Professional Growth
              </h4>
              <p className="text-silver-600">
                Certification programs and career advancement opportunities
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-platinum-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-900 to-silver-800 rounded-lg flex items-center justify-center shadow-elegant">
                <span className="text-white font-elegant text-sm">L</span>
              </div>
              <span className="text-lg font-elegant font-semibold text-primary-900">LEA Aesthetics Academy</span>
            </div>
            <p className="text-silver-600">
              &copy; 2024 LEA Aesthetics Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
