import { type NextRequest, NextResponse } from "next/server";

/** Decode a JWT and check it hasn't expired (Edge Runtime safe). */
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Expose the pathname so server components can read it (e.g. admin layout).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Protect admin routes, let the login page through.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("nhost-token")?.value;
    if (!isTokenValid(token)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
