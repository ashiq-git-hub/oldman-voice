import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_ADMIN_COOKIE } from "@/lib/auth-check";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    const cookieStore = cookies();
    cookieStore.delete(MOCK_ADMIN_COOKIE);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Failed to sign out." }, { status: 500 });
  }
}
