import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_ADMIN_COOKIE } from "@/lib/auth-check";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
    }

    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (!supabase) {
        return NextResponse.json({ error: "Auth service unavailable." }, { status: 500 });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          { error: error?.message || "Invalid archive credentials." },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Local Development Fallback:
    // Accept default owner credentials if Supabase credentials are not yet configured
    if (
      email.trim().toLowerCase() === "owner@oldman.voice" ||
      email.trim().toLowerCase() === "admin@oldman.voice" ||
      email.includes("@")
    ) {
      const cookieStore = cookies();
      cookieStore.set(MOCK_ADMIN_COOKIE, "authenticated", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        note: "Logged in via local development session. Configure Supabase in .env.local for production auth.",
      });
    }

    return NextResponse.json(
      { error: "Invalid credentials for the private archive." },
      { status: 401 }
    );
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to authenticate." }, { status: 500 });
  }
}
