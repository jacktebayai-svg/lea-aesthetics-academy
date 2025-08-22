'use client';

import React, { useState } from 'react';
import { LEALoginForm } from '@master-aesthetics-suite/ui';
import { useRouter } from 'next/navigation';

export default function ClientLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token in localStorage or cookie
        localStorage.setItem('client_token', data.token);
        localStorage.setItem('user_role', 'client');
        
        // Redirect to client portal
        router.push('/portal/client');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // For now, direct to main auth signin until forgot password is implemented
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    // Clients can register for appointments
    router.push('/register');
  };

  return (
    <LEALoginForm
      variant="client"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      showSignUp={true}
      isLoading={isLoading}
    />
  );
}
