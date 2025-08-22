import { NextRequest, NextResponse } from 'next/server'

// This route is deprecated - payment functionality needs to be rebuilt for Supabase architecture

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Payment functionality needs to be rebuilt for the Supabase architecture.' 
    },
    { status: 410 } // Gone
  )
}
