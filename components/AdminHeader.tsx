"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { label: "Today", href: "/admin" },
    { label: "Archive", href: "/admin/archive" },
    { label: "Questions", href: "/admin/questions" },
    { label: "Old Man Writes", href: "/admin/writes" },
  ];

  return (
    <header className="w-full border-b border-rule bg-[#FAF7F0] select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-wrap">
          <Link href="/admin" className="group inline-flex items-baseline">
            <span className="font-serif text-lg sm:text-xl font-medium tracking-tight text-ink">
              theoldman.keeps
            </span>
            <span className="ml-2 text-[10px] tracking-[0.2em] uppercase text-brass font-sans">
              private archive
            </span>
          </Link>

          <span className="text-rule hidden sm:inline">|</span>

          <Link
            href="/"
            target="_blank"
            className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink font-sans transition-colors shrink-0"
            title="Open public journal in new tab"
          >
            view public site ↗
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto no-scrollbar pt-1 sm:pt-0 -mx-1 px-1 sm:mx-0 sm:px-0">
          <nav className="flex items-center gap-3.5 sm:gap-6 shrink-0">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] sm:text-xs uppercase tracking-archive whitespace-nowrap transition-colors duration-200 py-1 ${
                    isActive
                      ? "text-ink font-semibold border-b border-ink/40 pb-0.5"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-[11px] sm:text-xs uppercase tracking-archive text-ink-faint hover:text-red-800 transition-colors ml-2 sm:ml-2 shrink-0 py-1 whitespace-nowrap"
          >
            {isLoggingOut ? "leaving..." : "sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
