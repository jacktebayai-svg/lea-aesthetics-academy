'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={`bg-white shadow-card ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-serif text-2xl font-semibold text-primary">
              LEA Aesthetics Academy
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/services" className="nav-link">
                Services
              </Link>
              <Link href="/courses" className="nav-link">
                Courses
              </Link>
              <Link href="/about" className="nav-link">
                About
              </Link>
              <Link href="/contact" className="nav-link">
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
            <Link href="/book-appointment" className="btn-primary">
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-surface p-2 rounded-md text-text-secondary hover:text-primary hover:bg-border transition-colors"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface shadow-card">
            <Link href="/" className="nav-link block">
              Home
            </Link>
            <Link href="/services" className="nav-link block">
              Services
            </Link>
            <Link href="/courses" className="nav-link block">
              Courses
            </Link>
            <Link href="/about" className="nav-link block">
              About
            </Link>
            <Link href="/contact" className="nav-link block">
              Contact
            </Link>
            <div className="pt-4 pb-2 space-y-2">
              <Link href="/login" className="btn-secondary block text-center">
                Login
              </Link>
              <Link href="/book-appointment" className="btn-primary block text-center">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
