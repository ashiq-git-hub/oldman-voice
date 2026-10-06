import { Question } from "@/types/database";

interface QuestionCardProps {
  question: Question | null;
}

export function formatDateString(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayStr = String(day).padStart(2, "0");
    const monthNames = [
      "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
      "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const monthStr = monthNames[dateObj.getMonth()] || "OCTOBER";
    return `${dayStr} / ${monthStr} / ${year}`;
  } catch {
    return dateStr;
  }
}

export default function QuestionCard({ question }: QuestionCardProps) {
  if (!question) {
    return (
      <div className="py-8 sm:py-16 text-center select-none">
        <p className="text-[10px] sm:text-xs uppercase tracking-archive text-ink-faint mb-3">
          Today
        </p>
        <h2 className="font-serif text-2xl sm:text-4xl text-ink font-normal italic tracking-tight leading-snug">
          Today&apos;s question is still being written.
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-ink-muted max-w-sm mx-auto font-sans leading-relaxed">
          The ink is still drying. Please return shortly or check back tomorrow morning.
        </p>
      </div>
    );
  }

  const formattedDate = formatDateString(question.question_date);

  return (
    <div className="text-left py-2 sm:py-6">
      {/* Editorial Date Mast */}
      <div className="flex items-center gap-2.5 mb-3.5 sm:mb-5">
        <span className="w-3.5 h-px bg-brass inline-block" />
        <time
          dateTime={question.question_date}
          className="text-[11px] sm:text-[13px] tracking-archive font-sans text-brass font-medium uppercase"
        >
          {formattedDate}
        </time>
      </div>

      {/* Main Editorial Question */}
      <h1 className="font-serif text-[1.85rem] sm:text-4xl md:text-[3.25rem] text-ink font-normal leading-[1.25] sm:leading-[1.18] tracking-tight">
        {question.question}
      </h1>
    </div>
  );
}
