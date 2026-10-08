import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import AdminHeader from "@/components/AdminHeader";
import AdminResponsesFeed from "@/components/AdminResponsesFeed";
import { formatDateString } from "@/components/QuestionCard";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore, getTodayDateString } from "@/lib/mock-store";
import { Question, ResponseItem } from "@/types/database";

export const dynamic = "force-dynamic";

async function getTodayAdminData(): Promise<{
  question: Question | null;
  responses: ResponseItem[];
}> {
  const todayStr = getTodayDateString();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      // Find today's question
      const { data: qData } = await supabase
        .from("questions")
        .select("*")
        .eq("question_date", todayStr)
        .single();

      let question: Question | null = (qData as Question) || null;

      // If no exact match today, fetch the latest scheduled question
      if (!question) {
        const { data: latestQ } = await supabase
          .from("questions")
          .select("*")
          .order("question_date", { ascending: false })
          .limit(1)
          .single();
        question = (latestQ as Question) || null;
      }

      if (question) {
        // Fetch responses strictly for this question
        const { data: rData } = await supabase
          .from("responses")
          .select("*")
          .eq("question_id", question.id)
          .order("created_at", { ascending: false });

        return {
          question,
          responses: (rData as ResponseItem[]) || [],
        };
      }
    }
  }

  // Fallback to local store
  const question = mockStore.getTodayQuestion() || mockStore.getQuestions()[0] || null;
  const responses = question ? mockStore.getResponsesForQuestion(question.id) : [];

  return { question, responses };
}

export default async function AdminTodayPage() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const { question, responses } = await getTodayAdminData();

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink paper-texture">
      <AdminHeader />

      <main className="w-full max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14 flex-1">
        {/* Today's Question Section */}
        <section className="mb-10 pb-8 border-b border-rule">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] uppercase tracking-archive text-brass font-medium">
              Today&apos;s Active Inquiry
            </span>
            {question && (
              <>
                <span className="text-rule font-sans">·</span>
                <time className="text-[11px] uppercase tracking-wider text-ink-faint font-sans">
                  {formatDateString(question.question_date)}
                </time>
              </>
            )}
          </div>

          {question ? (
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink font-normal leading-snug">
              &ldquo;{question.question}&rdquo;
            </h1>
          ) : (
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal italic">
              No question scheduled for today yet.
            </h1>
          )}
        </section>

        {/* Responses Feed */}
        <AdminResponsesFeed
          question={question}
          initialResponses={responses}
        />
      </main>
    </div>
  );
}
