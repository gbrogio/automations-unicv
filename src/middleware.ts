import { type NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const { device } = userAgent(req)
  const viewport = device.type === 'mobile' ? 'mobile' : 'desktop'

  if (viewport === 'mobile') {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/block', req.nextUrl));
}

export const config = {
  matcher: ['/'],
}