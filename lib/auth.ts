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

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
