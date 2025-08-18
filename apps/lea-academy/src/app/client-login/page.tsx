'use client';

import React from 'react';
import { LEALoginForm } from '@master-aesthetics-suite/ui';

export default function ClientLoginPage() {
  const handleLogin = (email: string, password: string) => {
    // TODO: Implement client authentication logic
    console.log('Client login:', { email, password });
    // For now, redirect to a client dashboard placeholder
    window.location.href = '/client-dashboard';
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic for clients
    console.log('Client forgot password');
    // For now, show an alert
    alert('Password reset functionality will be implemented soon. Please contact support.');
  };

  const handleSignUp = () => {
    // TODO: Implement client registration
    console.log('Client registration');
    // For now, redirect to registration page
    window.location.href = '/client-registration';
  };

  return (
    <LEALoginForm
      variant="client"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      onSignUp={handleSignUp}
      showSignUp={true}
    />
  );
}
