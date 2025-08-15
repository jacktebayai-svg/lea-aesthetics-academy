'use client';

import React, { useState } from 'react';
import { cn } from './utils/cn';
import LEALogo from './LEALogo';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card } from './components/Card';

interface LEALoginFormProps {
  className?: string;
  variant?: 'student' | 'client' | 'admin';
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  showSignUp?: boolean;
  isLoading?: boolean;
}

const LEALoginForm: React.FC<LEALoginFormProps> = ({
  className,
  variant = 'client',
  onSubmit,
  onForgotPassword,
  onSignUp,
  showSignUp = true,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email, password);
  };

  // Maerose luxury branding configuration
  const variantConfig = {
    student: {
      title: 'Student Portal',
      subtitle: 'Excellence in Aesthetic Education',
      description: 'Access your advanced training materials and certification progress',
      icon: (
        <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    client: {
      title: 'Client Portal', 
      subtitle: 'Your Aesthetic Journey',
      description: 'Manage your exclusive treatments and personalized care',
      icon: (
        <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    admin: {
      title: 'Practice Management',
      subtitle: 'Lea\'s Aesthetics Clinical Academy',
      description: 'Comprehensive business suite and educational platform',
      icon: (
        <svg className="w-6 h-6 text-champagne-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  };

  const config = variantConfig[variant];

  return (
    <div className={cn(
      // Maerose noir background with subtle gradient
      'min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8',
      'bg-gradient-to-b from-primary-noir to-deep-charcoal',
      className
    )}>
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #C5A880 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header with luxury spacing */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-deep-charcoal rounded-full shadow-[0_8px_40px_rgba(197,168,128,0.15)]">
              {config.icon}
            </div>
          </div>
          
          <LEALogo size="lg" variant="full" color="light" className="justify-center" />
          
          <div className="space-y-2">
            <h2 className="text-4xl font-inter font-bold text-ivory-white tracking-tight">
              {config.title}
            </h2>
            <p className="text-sm font-inter font-light text-champagne-gold uppercase tracking-widest">
              {config.subtitle}
            </p>
            <p className="text-body-regular text-soft-mist-grey font-light mt-2">
              {config.description}
            </p>
          </div>
        </div>

        {/* Login Form - Maerose luxury card */}
        <Card className="p-10 bg-deep-charcoal border border-estate-border-grey shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-[24px]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-body-small font-inter font-medium text-soft-mist-grey mb-3 uppercase tracking-wider">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-primary-noir border-estate-border-grey text-ivory-white placeholder:text-[#AAAAAA] focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(197,168,128,0.1)] rounded-lg px-4 py-3 transition-all duration-300 ease-in-out"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-body-small font-inter font-medium text-soft-mist-grey mb-3 uppercase tracking-wider">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-primary-noir border-estate-border-grey text-ivory-white placeholder:text-[#AAAAAA] focus:border-champagne-gold focus:shadow-[0_0_0_3px_rgba(197,168,128,0.1)] rounded-lg px-4 py-3 transition-all duration-300 ease-in-out"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-primary-noir border-estate-border-grey text-champagne-gold focus:ring-champagne-gold focus:ring-offset-0 rounded transition-all duration-300"
                />
                <label htmlFor="remember-me" className="ml-3 block text-body-small text-soft-mist-grey font-light">
                  Remember me
                </label>
              </div>

              {onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-body-small text-champagne-gold hover:text-champagne-highlight transition-all duration-300 ease-in-out font-light"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Maerose luxury button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-champagne-gold hover:bg-champagne-highlight text-primary-noir py-4 px-8 rounded-[24px] font-inter font-semibold uppercase tracking-wide shadow-[0_4px_20px_rgba(197,168,128,0.3)] hover:shadow-[0_6px_30px_rgba(197,168,128,0.4)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-noir" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                `Enter ${config.title}`
              )}
            </Button>

            {showSignUp && onSignUp && variant !== 'admin' && (
              <div className="text-center pt-4 border-t border-estate-border-grey">
                <p className="text-body-small text-soft-mist-grey font-light">
                  {variant === 'student' ? "Ready to elevate your expertise?" : "Begin your aesthetic journey"}
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="ml-2 text-champagne-gold hover:text-champagne-highlight transition-all duration-300 ease-in-out font-medium"
                  >
                    {variant === 'student' ? 'Apply Now' : 'Register'}
                  </button>
                </p>
              </div>
            )}
          </form>
        </Card>

        {/* Additional Portal Links - Maerose luxury styling */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-px bg-estate-border-grey flex-1 max-w-[100px]"></div>
            <p className="text-body-small text-soft-mist-grey font-light uppercase tracking-wider">Access Portal</p>
            <div className="h-px bg-estate-border-grey flex-1 max-w-[100px]"></div>
          </div>
          
          <div className="flex justify-center space-x-8">
            {variant !== 'student' && (
              <a 
                href="/student-login" 
                className="group flex items-center space-x-2 text-soft-mist-grey hover:text-champagne-gold transition-all duration-300 ease-in-out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
                <span className="text-body-small font-light">Student</span>
              </a>
            )}
            {variant !== 'client' && (
              <a 
                href="/client-login" 
                className="group flex items-center space-x-2 text-soft-mist-grey hover:text-champagne-gold transition-all duration-300 ease-in-out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-body-small font-light">Client</span>
              </a>
            )}
            {variant !== 'admin' && (
              <a 
                href="/admin/login" 
                className="group flex items-center space-x-2 text-soft-mist-grey hover:text-champagne-gold transition-all duration-300 ease-in-out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-body-small font-light">Admin</span>
              </a>
            )}
          </div>
        </div>

        {/* Back to Main Site - Maerose luxury footer */}
        <div className="text-center pt-8">
          <a 
            href="/" 
            className="inline-flex items-center text-body-small text-soft-mist-grey hover:text-champagne-gold transition-all duration-300 ease-in-out group"
          >
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-light uppercase tracking-wider">Lea's Aesthetics Clinical Academy</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LEALoginForm;
