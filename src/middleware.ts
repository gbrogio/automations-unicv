import { type NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  return NextResponse.next();
  
  /* const { device } = userAgent(req);
  const viewport = device.type === 'mobile' ? 'mobile' : 'desktop';

  const now = new Date();
  const hour = now.getUTCHours() - 3;
  const minutes = now.getUTCMinutes();
  const time = hour * 60 + minutes;
  
  const firstTime = time >= 21 * 60 + 30 && time <= 22 * 60;
  const secondTime = time >= 22 * 60 + 10 && time <= 22 * 60 + 40;
  
  if (viewport === 'mobile' && (firstTime || secondTime)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/block`, req.nextUrl)); */
}

export const config = {
  matcher: ['/'],
}