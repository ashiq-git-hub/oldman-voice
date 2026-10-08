import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import { isValidQuestionId } from "@/lib/validation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mock-store";
import { ResponseItem } from "@/types/database";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { id: questionId } = params;
  if (!questionId || !isValidQuestionId(questionId)) {
    return NextResponse.json({ error: "Valid question ID required." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("question_id", questionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch responses error:", error);
      return NextResponse.json({ error: "Failed to load responses." }, { status: 500 });
    }

    return NextResponse.json({ responses: (data as ResponseItem[]) || [] });
  }

  const responses = mockStore.getResponsesForQuestion(questionId);
  return NextResponse.json({ responses });
}
