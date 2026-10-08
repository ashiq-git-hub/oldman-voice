import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MOCK_ADMIN_COOKIE } from "@/lib/auth-check";
import { checkRateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting on login attempts to prevent brute-force attacks
    const forwardHeader = req.headers.get("x-forwarded-for") || "local-client";
    const clientRef = forwardHeader.split(",")[0].trim();
    const rateLimit = checkRateLimit(`login:${clientRef}`, 5, 60000); // 5 attempts per minute max

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    // 2. Parse payload with size guard
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 5120) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
    }

    const { email, password } = body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // 3. Supabase Auth Verification
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
          { error: "Invalid archive credentials." },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 4. Local Development Fallback (Strictly prohibited in production)
    if (process.env.NODE_ENV !== "production") {
      const normalized = email.trim().toLowerCase();
      if (
        normalized === "owner@theoldman.keeps" ||
        normalized === "admin@theoldman.keeps" ||
        normalized === "owner@oldman.voice" ||
        normalized === "admin@oldman.voice"
      ) {
        const cookieStore = cookies();
        cookieStore.set(MOCK_ADMIN_COOKIE, "authenticated", {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        return NextResponse.json({
          success: true,
          note: "Logged in via local development session.",
        });
      }
    }

    return NextResponse.json(
      { error: "Invalid credentials for the private archive." },
      { status: 401 }
    );
  } catch (err: unknown) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Failed to authenticate." }, { status: 500 });
  }
}
