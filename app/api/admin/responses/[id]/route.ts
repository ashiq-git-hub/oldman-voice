import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import { isValidQuestionId } from "@/lib/validation";
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

  const { id } = params;
  if (!id || !isValidQuestionId(id)) {
    return NextResponse.json({ error: "Valid response ID required." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
    }

    const { error } = await supabase.from("responses").delete().eq("id", id);
    if (error) {
      console.error("Delete response error:", error);
      return NextResponse.json({ error: "Unable to delete response." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  const success = mockStore.deleteResponse(id);
  return NextResponse.json({ success });
}
