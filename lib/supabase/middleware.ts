import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeRedirectPath } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: CookieOptions;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  if (isApiRoute) {
    return supabaseResponse;
  }

  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  );

  const publicRoutes = [
    ...authRoutes,
    "/manifest.webmanifest",
    "/favicon.ico",
  ];
  const isPublicRoute =
    publicRoutes.some((route) =>
      request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
    ) || request.nextUrl.pathname.startsWith("/auth");

  // Check for Demo Mode session cookie
  const demoCookie = request.cookies.get("spendwise_demo_session");
  const isDemoAuthenticated = demoCookie?.value === "true";

  if (isDemoAuthenticated) {
    // If already authenticated in demo mode, redirect away from login/signup to /dashboard
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
      const url = request.nextUrl.clone();
      const nextParam = request.nextUrl.searchParams.get("next") || request.nextUrl.searchParams.get("redirect");
      url.pathname = sanitizeRedirectPath(nextParam, "/dashboard");
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If using placeholder/demo Supabase URL and unauthenticated, route to login
  const isPlaceholderUrl =
    supabaseUrl.includes("spendwise-demo.supabase.co") ||
    supabaseUrl.includes("placeholder") ||
    supabaseAnonKey.includes("demo-anon-key");

  if (isPlaceholderUrl) {
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const originalPath = request.nextUrl.pathname + request.nextUrl.search;
      url.searchParams.set("next", originalPath);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Live Supabase authentication verification
  let user = null;
  try {
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2000)
    );
    const { data } = await Promise.race([getUserPromise, timeoutPromise]);
    user = data.user;
  } catch {
    user = null;
  }

  // Unauthenticated users hitting protected routes go to /login?next=<original path>
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const originalPath = request.nextUrl.pathname + request.nextUrl.search;
    url.searchParams.set("next", originalPath);
    return NextResponse.redirect(url);
  }

  // Authenticated users visiting /login or /signup go to /dashboard (or next)
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    const nextParam = request.nextUrl.searchParams.get("next") || request.nextUrl.searchParams.get("redirect");
    url.pathname = sanitizeRedirectPath(nextParam, "/dashboard");
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
