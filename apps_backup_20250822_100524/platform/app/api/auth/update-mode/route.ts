import { NextRequest, NextResponse } from 'next/server'

// This route is deprecated - the current schema doesn't support switching between modes
// Users have a single role (ADMIN, CLIENT, STUDENT) in the simplified architecture

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. The current architecture uses fixed user roles instead of switchable modes.' 
    },
    { status: 410 } // Gone
  )
}
