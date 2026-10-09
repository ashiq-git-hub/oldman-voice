"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to access the archive.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between paper-texture">
      {/* Top minimal bar */}
      <header className="w-full max-w-4xl mx-auto px-6 sm:px-8 pt-8">
        <Link
          href="/"
          className="text-xs uppercase tracking-archive text-ink-muted hover:text-ink transition-colors duration-200"
        >
          ← return to journal
        </Link>
      </header>

      {/* Main Login Form */}
      <main className="w-full max-w-sm mx-auto px-6 py-12 my-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-normal text-ink tracking-tight">
            theoldman.keeps
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-brass font-sans mt-1">
            private archive
          </p>
          <div className="w-8 h-px bg-rule mx-auto mt-4" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-archive text-ink-muted font-sans mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@theoldman.keeps"
              className="w-full bg-[#FAF7F0] border border-rule px-4 py-2.5 text-base sm:text-sm text-ink font-sans outline-none focus:border-brass focus-visible:ring-1 focus-visible:ring-brass transition-colors rounded-none placeholder:text-ink-faint/50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-archive text-ink-muted font-sans mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#FAF7F0] border border-rule px-4 py-2.5 text-base sm:text-sm text-ink font-sans outline-none focus:border-brass focus-visible:ring-1 focus-visible:ring-brass transition-colors rounded-none placeholder:text-ink-faint/50"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="text-xs text-red-800 font-sans tracking-wide pt-1"
            >
              {errorMessage}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="vintage-btn w-full justify-center px-6 py-3 bg-ink text-parchment hover:bg-charcoal active:bg-ink-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:opacity-50 text-xs font-medium tracking-archive uppercase rounded-none transition-all shadow-sm"
            >
              {isLoading ? (
                <span>verifying seal...</span>
              ) : (
                <>
                  <span>enter archive</span>
                  <span className="arrow-icon">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[11px] text-ink-faint leading-relaxed font-sans">
          This area is reserved for the private curator of theoldman.keeps.
          <br />
          No public registrations are permitted.
        </p>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-xs text-ink-faint font-sans">
        theoldman.keeps · restricted repository
      </footer>
    </div>
  );
}
