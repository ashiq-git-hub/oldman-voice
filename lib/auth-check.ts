import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const MOCK_ADMIN_COOKIE = "oldman_admin_session";

export async function isCurrentUserAdmin(): Promise<boolean> {
  // If Supabase is configured, verify via Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (!supabase) return false;
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Fallback mode for local development: check mock admin cookie
  const cookieStore = cookies();
  const mockSession = cookieStore.get(MOCK_ADMIN_COOKIE);
  return Boolean(mockSession && mockSession.value === "authenticated");
}
