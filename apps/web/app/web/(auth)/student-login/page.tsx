'use client';

import React, { useState } from 'react';
import { LEALoginForm } from '@/lib/ui/LEALoginForm';
import { useRouter } from 'next/navigation';

export default function StudentLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token in localStorage or cookie
        localStorage.setItem('student_token', data.token);
        localStorage.setItem('user_role', 'student');
        
        // Redirect to student dashboard
        router.push('/student/dashboard');
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
    router.push('/student/forgot-password');
  };

  const handleSignUp = () => {
    // Students apply through a different process
    router.push('/courses/apply');
  };

  return (
    <LEALoginForm
      variant="student"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      showSignUp={true}
      isLoading={isLoading}
    />
  );
}
