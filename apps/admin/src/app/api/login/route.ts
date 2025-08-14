import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Hardcoded demo user for now
  if (email === 'admin@leas.com' && password === 'password') {
    // In a real app, you would generate a secure token/session ID
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'demo_token', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }); // 1 day
    return NextResponse.json({ message: 'Login successful' });
  } else {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}
