
import { NextResponse, type NextRequest } from 'next/server'

// This middleware is a placeholder. 
// In a real app with server-side auth, you'd handle session validation here.
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login/:path*'],
}
