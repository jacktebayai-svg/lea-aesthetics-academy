"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Maerose Navigation Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeStyle = { color: '#A18A49' };
  const inactiveStyle = { color: '#F9F4E5' };
  const activeClass = "font-semibold relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-current";
  const inactiveClass = "hover:text-opacity-80 transition-colors duration-300";

  return (
    <header className={`sticky top-0 z-50 transition-all duration-modal maerose-ease ${
      isScrolled 
        ? 'bg-primary-noir shadow-maerose-soft border-b border-estate-border-grey' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-maerose-container mx-auto px-maerose-gutter-desktop md:px-maerose-gutter-mobile">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-heading-3 font-inter font-bold text-ivory-white uppercase tracking-wide maerose-focus"
            >
              MAEROSE
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${pathname === "/" ? activeClass : inactiveClass} transition-colors duration-modal maerose-ease font-medium uppercase tracking-wide text-body-regular maerose-focus`}
            >
              HOME
            </Link>
            <Link
              href="/clinic"
              className={`${pathname === "/clinic" ? activeClass : inactiveClass} transition-colors duration-modal maerose-ease font-medium uppercase tracking-wide text-body-regular maerose-focus`}
            >
              CLINIC
            </Link>
            <Link
              href="/academy"
              className={`${pathname === "/academy" ? activeClass : inactiveClass} transition-colors duration-modal maerose-ease font-medium uppercase tracking-wide text-body-regular maerose-focus`}
            >
              ACADEMY
            </Link>
            <Link
              href="/demo-booking"
              className="maerose-button-secondary px-4 py-2 text-body-small uppercase tracking-wide ml-4 maerose-focus"
            >
              BOOK NOW
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
