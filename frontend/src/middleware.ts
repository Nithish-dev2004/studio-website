// Next.js middleware protecting all /admin routes.
// Ensures that:
// 1. Super Admins (ADMIN_EMAILS) always have access.
// 2. Active staff members have access to the console according to their role.
// 3. Inactive staff members are immediately redirected with an inactive error.
// 4. Only the 'admin' role can access /admin/users.

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

  if (!url || !anonKey) {
    // If Supabase is not configured, redirect to login with a warning parameter
    if (request.nextUrl.pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "unconfigured");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Set up Supabase SSR client to inspect session cookies
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

  // IMPORTANT: Use getUser() instead of getSession() for secure server verification
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isSuperAdmin =
    user && user.email && adminEmails.includes(user.email.toLowerCase());

  // 1. Super Admin: always allowed
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

          // Active staff member:
          if (pathname === "/admin/login") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }

          // Role-based route guard: only 'admin' can open /admin/users
          if (pathname.startsWith("/admin/users") && staffUser.role !== "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }

          return response;
        }
      }
    } catch {
      // Fall through to server-side guard on fetch error
    }
  }

  // 4. Logged in but neither super admin nor active staff: refuse
  if (pathname === "/admin/login") {
    return response;
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", "forbidden");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Execute middleware on admin and staff account routes
  matcher: ["/admin/:path*", "/account/:path*"],
};
