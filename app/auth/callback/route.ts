import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") || searchParams.get("state");
  const targetNext = sanitizeRedirectPath(rawNext, "/dashboard");

  if (code) {
    // 1. Direct Google OAuth flow (handles credentials configured in .env.local)
    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "176968816003-gh8en4aoq79l7ha200bjq4e4ntb281f1.apps.googleusercontent.com";
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (googleClientSecret && googleClientId) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: `${origin}/auth/callback`,
            grant_type: "authorization_code",
          }),
        });

        if (tokenRes.ok) {
          const tokens = await tokenRes.json();
          if (tokens.access_token) {
            const userRes = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              }
            );

            if (userRes.ok) {
              const userData = await userRes.json();
              const response = NextResponse.redirect(`${origin}${targetNext}`);
              response.cookies.set("spendwise_demo_session", "true", {
                path: "/",
                httpOnly: false,
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
              });
              if (userData.email) {
                response.cookies.set("spendwise_user_email", userData.email, {
                  path: "/",
                  httpOnly: false,
                  sameSite: "lax",
                  maxAge: 60 * 60 * 24 * 7,
                });
              }
              if (userData.name) {
                response.cookies.set("spendwise_user_name", userData.name, {
                  path: "/",
                  httpOnly: false,
                  sameSite: "lax",
                  maxAge: 60 * 60 * 24 * 7,
                });
              }
              if (userData.picture) {
                response.cookies.set("spendwise_user_avatar", userData.picture, {
                  path: "/",
                  httpOnly: false,
                  sameSite: "lax",
                  maxAge: 60 * 60 * 24 * 7,
                });
              }
              return response;
            }
          }
        }
      } catch (err) {
        console.error("Direct Google OAuth error:", err);
      }
    }

    // 2. Supabase OAuth callback flow
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${targetNext}`);
      }
    } catch (err) {
      console.error("Supabase exchangeCodeForSession error:", err);
    }
  }

  // On error or missing code, redirect to login with error parameter
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
