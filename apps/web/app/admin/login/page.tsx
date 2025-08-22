'use client';

import React, { useState } from 'react';
import LEALoginForm from '@/lib/ui/LEALoginForm';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store admin token
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', data.token || 'demo_token');
          localStorage.setItem('user_role', 'admin');
        }
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        // More elegant error handling for luxury brand
        console.error('Authentication failed:', errorData);
        alert(errorData.message || "Authentication failed. Please verify your credentials.");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('We apologize for the inconvenience. Please try again momentarily.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to admin password reset
    console.log('Admin password reset requested');
    alert('Please contact Lea directly for admin password reset.');
  };

  return (
    <>
      <LEALoginForm
        variant="admin"
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        showSignUp={false} // Admins are appointed by Lea only
        isLoading={isLoading}
      />
      
      {/* Elegant demo credentials notice with Maerose styling */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-6 right-6 bg-deep-charcoal border border-estate-border-grey p-6 rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.4)] max-w-sm">
          <p className="text-body-small font-inter font-light text-champagne-gold uppercase tracking-wider mb-3">
            Development Access
          </p>
          <div className="space-y-1 text-soft-mist-grey font-light text-body-small">
            <p>
              <span className="text-champagne-gold">Email:</span> lea@leas-academy.com
            </p>
            <p>
              <span className="text-champagne-gold">Password:</span> ••••••••
            </p>
          </div>
          <p className="text-xs text-soft-mist-grey/60 mt-3 font-light italic">
            Single practitioner mode
          </p>
        </div>
      )}
    </>
  );
}
