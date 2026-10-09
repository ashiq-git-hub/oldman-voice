import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth-check";
import AdminHeader from "@/components/AdminHeader";
import AdminWritesStudio from "@/components/AdminWritesStudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Old Man Writes Studio | theoldman.keeps Admin",
  description: "Create and render high-resolution Old Man Writes posts with dusty rose vintage stationery.",
};

export default async function AdminWritesPage() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-parchment text-ink paper-texture flex flex-col">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 min-w-0">
        <AdminWritesStudio />
      </main>
    </div>
  );
}
