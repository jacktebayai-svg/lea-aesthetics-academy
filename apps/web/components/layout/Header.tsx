'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const activeClass = "text-gold font-semibold";
  const inactiveClass = "text-mist hover:text-gold";

  return (
    <header className="bg-ivory/80 backdrop-blur-sm sticky top-0 z-50 border-b border-smoke">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-playfair font-bold text-slate">
              Lea's Clinical Academy
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${pathname === '/' ? activeClass : inactiveClass} transition-colors duration-300 font-medium`}>
              Home
            </Link>
            <Link href="/clinic" className={`${pathname === '/clinic' ? activeClass : inactiveClass} transition-colors duration-300 font-medium`}>
              Aesthetics Clinic
            </Link>
            <Link href="/academy" className={`${pathname === '/academy' ? activeClass : inactiveClass} transition-colors duration-300 font-medium`}>
              Student Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
