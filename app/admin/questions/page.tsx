import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import AdminHeader from "@/components/AdminHeader";
import AdminQuestionManager from "@/components/AdminQuestionManager";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mock-store";
import { QuestionWithResponseCount } from "@/types/database";

export const dynamic = "force-dynamic";

interface QuestionQueryRow {
  id: string;
  question: string;
  question_date: string;
  is_active: boolean;
  created_at: string;
  responses?: Array<{ count: number }>;
}

async function getAdminQuestions(): Promise<QuestionWithResponseCount[]> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      const { data, error } = await supabase
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

      if (!error && data) {
        return (data as unknown as QuestionQueryRow[]).map((q) => ({
          id: q.id,
          question: q.question,
          question_date: q.question_date,
          is_active: q.is_active,
          created_at: q.created_at,
          response_count: q.responses?.[0]?.count || 0,
        }));
      }
    }
  }

  return mockStore.getQuestionsWithCounts();
}

export default async function AdminQuestionsPage() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const questions = await getAdminQuestions();

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink paper-texture">
      <AdminHeader />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-7 sm:py-14 flex-1 min-w-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-4xl font-normal text-ink break-words">
            Question Management
          </h1>
          <p className="text-xs uppercase tracking-archive text-ink-muted font-sans mt-2">
            Compose, schedule, and curate daily inquiries for the journal
          </p>
        </div>

        <AdminQuestionManager initialQuestions={questions} />
      </main>
    </div>
  );
}
