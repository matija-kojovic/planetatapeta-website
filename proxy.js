import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

// Keeps /admin pages behind the login. The admin layout and every admin API
// handler verify the session again on the server; this is the first gate.
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!(await isAdminRequest(request))) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
