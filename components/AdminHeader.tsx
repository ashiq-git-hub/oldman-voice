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
  ];

  return (
    <header className="w-full border-b border-rule bg-[#FAF7F0] select-none">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="group">
            <span className="font-serif text-xl font-medium tracking-tight text-ink">
              oldman.voice
            </span>
            <span className="ml-2 text-[10px] tracking-[0.2em] uppercase text-brass font-sans">
              private archive
            </span>
          </Link>

          <span className="text-rule hidden sm:inline">|</span>

          <Link
            href="/"
            target="_blank"
            className="text-[11px] uppercase tracking-wider text-ink-muted hover:text-ink font-sans transition-colors"
            title="Open public journal in new tab"
          >
            view public site ↗
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs uppercase tracking-archive transition-colors duration-200 ${
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
            className="text-xs uppercase tracking-archive text-ink-faint hover:text-red-800 transition-colors ml-2"
          >
            {isLoggingOut ? "leaving..." : "sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
