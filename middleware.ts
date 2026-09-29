import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/admin", "/lmo", "/gatc"];

export function middleware(request: NextRequest) {
  if (!protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) return NextResponse.next();
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/lmo/:path*", "/gatc/:path*"] };
