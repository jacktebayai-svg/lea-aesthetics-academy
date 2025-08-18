import { NextRequest, NextResponse } from 'next/server'

// This route is deprecated - registration is now handled by Supabase auth-provider
// The frontend registration form uses the auth-provider.tsx which integrates with Supabase Auth

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Registration is now handled by Supabase Auth via the frontend auth-provider.' 
    },
    { status: 410 } // Gone
  )
}
