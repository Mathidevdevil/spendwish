import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "demo@spendwise.app",
      full_name: "Aarav Sharma",
    },
  });

  // Set HTTP cookie so Next.js middleware and server components recognize auth
  response.cookies.set("spendwise_demo_session", "true", {
    path: "/",
    httpOnly: false, // Accessible by both client scripts and middleware
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  response.cookies.set("spendwise_user_email", "demo@spendwise.app", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("spendwise_user_name", "Aarav Sharma", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete("spendwise_demo_session");
  response.cookies.delete("spendwise_user_email");
  response.cookies.delete("spendwise_user_name");

  return response;
}

