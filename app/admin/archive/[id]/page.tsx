import { notFound, redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import AdminHeader from "@/components/AdminHeader";
import AdminInquiryResponsesView from "@/components/AdminInquiryResponsesView";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockStore } from "@/lib/mock-store";
import { Question, ResponseItem } from "@/types/database";

export const dynamic = "force-dynamic";

interface AdminInquiryPageProps {
  params: {
    id: string;
  };
}

async function getInquiryData(id: string): Promise<{
  question: Question | null;
  responses: ResponseItem[];
}> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      const { data: qData } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (qData) {
        const { data: rData } = await supabase
          .from("responses")
          .select("*")
          .eq("question_id", id)
          .order("created_at", { ascending: false });

        return {
          question: qData as Question,
          responses: (rData as ResponseItem[]) || [],
        };
      }
    }
  }

  // Fallback to mockStore
  const question = mockStore.getQuestionById(id);
  const responses = question ? mockStore.getResponsesForQuestion(id) : [];

  return { question, responses };
}

export default async function AdminInquiryResponsesPage({
  params,
}: AdminInquiryPageProps) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/admin/login");
  }

  const { id } = params;
  const { question, responses } = await getInquiryData(id);

  if (!question) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-ink paper-texture">
      <AdminHeader />

      <main className="w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-14 flex-1">
        <AdminInquiryResponsesView
          question={question}
          initialResponses={responses}
        />
      </main>
    </div>
  );
}
