import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/api/auth", "/offline"];
const STATIC_PREFIXES = ["/_next", "/icons", "/favicon.ico", "/manifest", "/sw.js"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public paths
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check for valid session
  const token = request.cookies.get("blf_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set("x-resident-id", payload.sub as string);
    response.headers.set("x-apartment", payload.apt as string);
    return response;
  } catch {
    // Invalid token — clear cookie and redirect
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("blf_session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
