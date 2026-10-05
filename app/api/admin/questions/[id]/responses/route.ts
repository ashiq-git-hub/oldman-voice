import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { id: questionId } = params;
  if (!questionId) {
    return NextResponse.json({ error: "Question ID required." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { error } = await supabase
      .from("responses")
      .delete()
      .eq("question_id", questionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  const count = mockStore.deleteAllResponsesForQuestion(questionId);
  return NextResponse.json({ success: true, count });
}
