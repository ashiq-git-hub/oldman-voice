import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuestionCard from "@/components/QuestionCard";
import ResponseForm from "@/components/ResponseForm";
import { mockStore, getTodayDateString } from "@/lib/mock-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Question } from "@/types/database";

// Revalidate page dynamically
export const revalidate = 60; // 1 minute revalidation for fresh daily questions

async function getTodayQuestion(): Promise<Question | null> {
  const todayStr = getTodayDateString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("question_date", todayStr)
          .eq("is_active", true)
          .single();

        if (!error && data) {
          return data as Question;
        }

        // If today's exact date is not scheduled, fallback to latest active question <= today
        const { data: latestData } = await supabase
          .from("questions")
          .select("*")
          .lte("question_date", todayStr)
          .eq("is_active", true)
          .order("question_date", { ascending: false })
          .limit(1)
          .single();

        if (latestData) {
          return latestData as Question;
        }
      }
    } catch {
      // Graceful fallback to mock store if Supabase network fails
    }
  }

  // Fallback to local store
  const directMatch = mockStore.getTodayQuestion();
  if (directMatch) return directMatch;

  // Or latest active question up to today
  const all = mockStore.getQuestions().filter((q) => q.question_date <= todayStr && q.is_active);
  return all[0] || null;
}

export default async function HomePage() {
  const question = await getTodayQuestion();

  return (
    <div className="flex-1 flex flex-col justify-between min-h-[100dvh]">
      <Header />

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-12 my-auto">
        <article aria-labelledby="question-heading">
          <QuestionCard question={question} />

          {question && (
            <div className="mt-2 sm:mt-6">
              <ResponseForm questionId={question.id} />
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
