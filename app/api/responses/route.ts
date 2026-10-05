import { NextRequest, NextResponse } from "next/server";
import { validateResponseSubmission } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (Privacy-Preserving Hashed Token)
    // Extract ephemeral client network reference solely to derive temporary hash; never stored.
    const forwardHeader = req.headers.get("x-forwarded-for") || "local-client";
    const clientRef = forwardHeader.split(",")[0].trim();
    const rateLimit = checkRateLimit(clientRef, 10, 60000); // 10 submissions per minute max

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "You are writing quickly. Please pause a moment before placing more words.",
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid submission payload." },
        { status: 400 }
      );
    }

    const { questionId, response, website_url_hp } = body;

    if (!questionId || typeof questionId !== "string") {
      return NextResponse.json(
        { error: "A valid question reference is required." },
        { status: 400 }
      );
    }

    // 3. Validation & Honeypot Check
    const validation = validateResponseSubmission(response, website_url_hp);
    if (!validation.valid || !validation.sanitized) {
      return NextResponse.json(
        { error: validation.error || "Invalid response." },
        { status: 400 }
      );
    }

    // 4. Persistence - Store ONLY question_id and response text (Zero identity or metadata)
    if (isSupabaseConfigured()) {
      // Use client or admin client to insert
      const supabase = createClient() || createAdminClient();
      if (!supabase) {
        throw new Error("Database connection unavailable.");
      }

      const { error } = await supabase.from("responses").insert({
        question_id: questionId,
        response: validation.sanitized,
      });

      if (error) {
        console.error("Database insert error:", error);
        return NextResponse.json(
          { error: "Unable to record your response. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // Local fallback mock store
      mockStore.addResponse(questionId, validation.sanitized);
    }

    // 5. Success response (Literary microcopy)
    return NextResponse.json(
      {
        success: true,
        message: "It's somewhere now.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Submission error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while placing your words." },
      { status: 500 }
    );
  }
}

// Ensure public users CANNOT SELECT responses via this route
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Responses are strictly private." },
    { status: 405 }
  );
}
