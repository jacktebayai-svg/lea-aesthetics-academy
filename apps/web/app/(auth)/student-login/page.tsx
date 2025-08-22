'use client';

import React, { useState } from 'react';
import { LEALoginForm } from '@master-aesthetics-suite/ui';
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
        
        // Redirect to student portal
        router.push('/portal/student');
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
    // Students apply through the courses page
    router.push('/courses');
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
