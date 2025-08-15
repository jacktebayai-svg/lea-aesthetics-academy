'use client';

import React from 'react';
import { LEALoginForm } from '@leas-academy/ui';

export default function StudentLoginPage() {
  const handleLogin = (email: string, password: string) => {
    // TODO: Implement student authentication logic
    console.log('Student login:', { email, password });
    // For now, redirect to a student dashboard placeholder
    window.location.href = '/student-dashboard';
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic for students
    console.log('Student forgot password');
    // For now, show an alert
    alert('Password reset functionality will be implemented soon. Please contact support.');
  };

  const handleRequestAccess = () => {
    // TODO: Implement student registration request
    console.log('Student access request');
    // For now, redirect to contact or show modal
    alert('To request student access, please contact our admissions team at admissions@lea-aesthetics.co.uk');
  };

  return (
    <LEALoginForm
      variant="student"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleRequestAccess}
      showSignUp={true}
    />
  );
}
