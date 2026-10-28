import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database";
import { DEMO_USER_ID } from "@/lib/demo-data";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("spendwise_demo_session");

  if (demoCookie?.value === "true") {
    const email = cookieStore.get("spendwise_user_email")?.value || "demo@spendwise.app";
    const name = cookieStore.get("spendwise_user_name")?.value || "Aarav Sharma";

    return {
      user: {
        id: DEMO_USER_ID,
        email,
        user_metadata: { full_name: name },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as any,
      profile: {
        id: DEMO_USER_ID,
        email,
        full_name: name,
        currency: "INR",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Profile,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (
    supabaseUrl.includes("spendwise-demo.supabase.co") ||
    supabaseUrl.includes("placeholder") ||
    supabaseKey.includes("demo-anon-key")
  ) {
    return null;
  }

  try {
    const supabase = await createClient();
    const getUserPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2000)
    );
    const { data } = await Promise.race([getUserPromise, timeoutPromise]);
    const user = data.user;

    if (!user) {
      return null;
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      user,
      profile: profile as Profile | null,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const data = await getCurrentUser();
  if (!data?.user) {
    redirect("/login");
  }
  return data;
}
