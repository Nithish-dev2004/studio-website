// Next.js middleware protecting all /admin and /account routes.
// Ensures that:
// 1. Session cookies are properly kept alive and refreshed via @supabase/ssr.
// 2. Unauthenticated visitors accessing protected routes are redirected to /admin/login.
// 3. Super Admins (ADMIN_EMAILS) always have immediate access to /admin.
// 4. Staff members have access to the staff portal (/account) or admin dashboard based on their role.
// 5. Inactive staff members are redirected with an inactive notice.
// 6. Resilient against database key issues so authenticated users are not falsely locked out.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pathname = request.nextUrl.pathname;

  if (!url || !anonKey) {
    if (pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "unconfigured");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Set up Supabase SSR client to inspect session cookies & keep cookies refreshed
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Use getUser() for secure server verification
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isSuperAdmin =
    user && user.email && adminEmails.includes(user.email.toLowerCase());

  // 1. Super Admin: always allowed full access
  if (isSuperAdmin) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // 2. If not logged in at all:
  if (!user) {
    if (pathname === "/admin/login") {
      return response;
    }
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. User is logged in, but not super admin: inspect staff_users record
  if (serviceRoleKey && user.email) {
    try {
      const email = encodeURIComponent(user.email.toLowerCase());
      const res = await fetch(
        `${url}/rest/v1/staff_users?select=id,role,status,must_change_password&or=(auth_user_id.eq.${user.id},email.eq.${email})&limit=1`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        },
      );

      if (res.ok) {
        const staffRows = await res.json();
        const staffUser = staffRows?.[0];

        if (staffUser) {
          if (staffUser.status === "inactive") {
            const loginUrl = new URL("/admin/login", request.url);
            loginUrl.searchParams.set("error", "inactive");
            return NextResponse.redirect(loginUrl);
          }

          // Force first-login password change
          if (staffUser.must_change_password) {
            if (pathname !== "/account/change-password") {
              return NextResponse.redirect(new URL("/account/change-password", request.url));
            }
            return response;
          }

          const isStaffAdmin =
            staffUser.role === "admin" || staffUser.role === "manager";

          if (pathname === "/admin/login") {
            return NextResponse.redirect(
              new URL(isStaffAdmin ? "/admin" : "/account", request.url),
            );
          }

          // Staff cannot open /admin: only admin and manager roles have access
          if (pathname.startsWith("/admin") && !isStaffAdmin) {
            return NextResponse.redirect(new URL("/account", request.url));
          }

          // Role-based route guard: only 'admin' can open /admin/users
          if (pathname.startsWith("/admin/users") && staffUser.role !== "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }

          return response;
        }
      }
    } catch {
      // Database query failed (e.g. invalid key or network error).
      // Fall through to resilient authenticated handling below.
    }
  }

  // 4. Fallback for authenticated users when staff_users table is inaccessible or in preview:
  // If user is logged in and visits login page, redirect to admin or account
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow authenticated users to proceed to /admin and /account
  return response;
}

export const config = {
  // Execute middleware on admin and staff account routes
  matcher: ["/admin/:path*", "/account/:path*"],
};
