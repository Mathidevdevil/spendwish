import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let email = "demo@spendwise.app";
  let fullName = "Aarav Sharma";

  try {
    const body = await request.json();
    if (body?.email) email = String(body.email);
    if (body?.name) fullName = String(body.name);
  } catch {}

  const response = NextResponse.json({
    success: true,
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      email,
      full_name: fullName,
    },
  });

  // Set HTTP cookie so Next.js middleware and server components recognize auth
  response.cookies.set("spendwise_demo_session", "true", {
    path: "/",
    httpOnly: false, // Accessible by both client scripts and middleware
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  response.cookies.set("spendwise_user_email", email, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("spendwise_user_name", fullName, {
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

