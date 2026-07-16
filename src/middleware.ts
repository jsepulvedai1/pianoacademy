import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("detache_session")?.value;
  const role = request.cookies.get("detache_user_role")?.value;
  const allowedSectionsStr = request.cookies.get("detache_allowed_sections")?.value;
  
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const parts = pathname.split("/").filter(Boolean);
    const section = parts[1]; // parts[0] is "admin"

    if (section && section !== "dashboard") {
      // /admin/users is restricted to ADMIN (Supreme Admin) only
      if (section === "users") {
        if (role !== "ADMIN") {
          const dashboardUrl = new URL("/admin/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      } else {
        // Enforce section checks for other roles
        let allowedSections: string[] = [];
        try {
          allowedSections = allowedSectionsStr ? JSON.parse(allowedSectionsStr) : [];
        } catch (e) {
          allowedSections = [];
        }

        // Non-ADMIN roles require section to be explicitly in allowedSections list
        if (role !== "ADMIN" && !allowedSections.includes(section)) {
          const dashboardUrl = new URL("/admin/dashboard", request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }
    }
  }

  // Redirect to dashboard if logged in when visiting login page
  if (pathname === "/login") {
    if (session) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Route matchers to limit execution scope
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
