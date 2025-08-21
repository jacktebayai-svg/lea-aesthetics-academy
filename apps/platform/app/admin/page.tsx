'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-platinum-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-900 to-silver-700 rounded-2xl flex items-center justify-center shadow-elegant mx-auto mb-4">
          <span className="text-white font-elegant text-2xl">L</span>
        </div>
        <h1 className="text-2xl font-elegant font-semibold text-primary-900 mb-2">
          LEA Aesthetics Academy
        </h1>
        <p className="text-silver-600">Loading admin dashboard...</p>
      </div>
    </div>
  );
}

