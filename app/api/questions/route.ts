import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import { validateQuestion } from "@/lib/validation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore, getTodayDateString } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

// GET questions
export async function GET(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  const todayStr = getTodayDateString();

  if (isSupabaseConfigured()) {
    const supabase = createClient() || createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    if (isAdmin) {
      // Admin sees all questions with response counts
      const { data: questions, error } = await supabase
        .from("questions")
        .select(`
          id,
          question,
          question_date,
          is_active,
          created_at,
          responses(count)
        `)
        .order("question_date", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Format response counts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = (questions || []).map((q: any) => ({
        id: q.id,
        question: q.question,
        question_date: q.question_date,
        is_active: q.is_active,
        created_at: q.created_at,
        response_count: q.responses?.[0]?.count || 0,
      }));

      return NextResponse.json({ questions: formatted });
    } else {
      // Public only sees active questions scheduled up to today
      const { data, error } = await supabase
        .from("questions")
        .select("id, question, question_date, is_active, created_at")
        .eq("is_active", true)
        .lte("question_date", todayStr)
        .order("question_date", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ questions: data });
    }
  }

  // Fallback to mock store
  if (isAdmin) {
    return NextResponse.json({ questions: mockStore.getQuestionsWithCounts() });
  } else {
    const publicQuestions = mockStore
      .getQuestions()
      .filter((q) => q.is_active && q.question_date <= todayStr);
    return NextResponse.json({ questions: publicQuestions });
  }
}

// POST create question (Admin only)
export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Missing body." }, { status: 400 });
  }

  const { question, question_date } = body;
  const validation = validateQuestion(question, question_date);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("questions")
      .insert({
        question: question.trim(),
        question_date,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ question: data }, { status: 201 });
  }

  // Mock store
  const newQuestion = mockStore.addQuestion(question.trim(), question_date);
  return NextResponse.json({ question: newQuestion }, { status: 201 });
}

// PUT update question (Admin only)
export async function PUT(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: "Question ID required." }, { status: 400 });
  }

  const { id, question, question_date, is_active } = body;
  const validation = validateQuestion(question, question_date);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("questions")
      .update({
        question: question.trim(),
        question_date,
        is_active: typeof is_active === "boolean" ? is_active : true,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ question: data });
  }

  const updated = mockStore.updateQuestion(id, question.trim(), question_date, is_active);
  if (!updated) {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  return NextResponse.json({ question: updated });
}

// DELETE question (Admin only)
export async function DELETE(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Question ID required." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  }

  const success = mockStore.deleteQuestion(id);
  return NextResponse.json({ success });
}
