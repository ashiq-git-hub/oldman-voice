import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About — oldman.voice",
  description:
    "A small place for unfinished thoughts, honest answers, and questions worth sitting with.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <Header />

      <main className="w-full max-w-2xl mx-auto px-6 sm:px-8 py-12 sm:py-20 my-auto">
        <article className="space-y-10 sm:space-y-12">
          {/* Section Masthead */}
          <div className="border-b border-rule pb-6">
            <span className="text-xs uppercase tracking-archive text-brass font-medium">
              About the journal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal mt-2 tracking-tight">
              A quiet place in a noisy world.
            </h1>
          </div>

          {/* Editorial Content */}
          <div className="space-y-6 font-serif text-lg sm:text-xl text-ink-light leading-[1.8]">
            <p>
              <strong className="font-normal text-ink">oldman.voice</strong> is a small place for
              unfinished thoughts, honest answers, and questions worth sitting with.
            </p>

            <div className="pl-6 border-l-2 border-brass/50 py-1 my-6 space-y-2 text-ink italic font-normal">
              <p>One question.</p>
              <p>One answer.</p>
              <p>No names attached.</p>
            </div>

            <p>
              Most of the internet asks who you are before listening to what you have to say.
              Here, there are no profiles, no metrics, no avatars, and no algorithms. Your words
              are received without identity, read with care, and held quietly.
            </p>

            <p className="text-base font-sans text-ink-muted leading-relaxed pt-2">
              Every day at dawn, a new inquiry is placed. What you choose to leave behind belongs
              to that moment alone.
            </p>
          </div>

          {/* Action Link */}
          <div className="pt-6 border-t border-rule flex items-center justify-between">
            <Link
              href="/"
              className="vintage-btn text-xs tracking-archive uppercase text-ink hover:text-brass transition-colors duration-200"
            >
              <span>return to today&apos;s question</span>
              <span className="arrow-icon">→</span>
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
