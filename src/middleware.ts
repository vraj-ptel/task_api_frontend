import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (request.url.includes("/sign-in") || request.url.includes("/sign-up")) {
    const token = request.cookies.get("token");
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    } else {
      return;
    }
  }
  if (request.url.includes("/dashboard")) {
    const token = request.cookies.get("token");
    if (token) return;
    return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
  }
  if (request.nextUrl.pathname == "/") {
    const token = request.cookies.get("token");
    if (token)
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    else {
      return NextResponse.redirect(new URL("/sign-in", request.nextUrl));
    }
  }

  return;
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
