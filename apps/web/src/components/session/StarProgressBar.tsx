"use client";

interface StarProgressBarProps {
  total: number;
  currentIndex: number;
  earnedIndices: ReadonlySet<number>;
}

function StarIcon({ filled, active }: { filled: boolean; active: boolean }) {
  return (
    <svg
      viewBox="0 0 36 36"
      className={`h-7 w-7 sm:h-8 sm:w-8 ${filled ? "animate-star-pop" : ""}`}
      aria-hidden="true"
    >
      <path
        d="M18 3.5 L22.2 12.2 L31.8 13.5 L24.8 20.1 L26.5 29.6 L18 25 L9.5 29.6 L11.2 20.1 L4.2 13.5 L13.8 12.2 Z"
        fill={filled ? "#FACC15" : active ? "#E0F2FE" : "#F1F5F9"}
        stroke={filled ? "#CA8A04" : active ? "#0284C7" : "#CBD5E1"}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Kid-friendly star progress track with inline SVG gold stars,
 * continuous golden progress ribbon, and spotlight indicator.
 */
export function StarProgressBar({
  total,
  currentIndex,
  earnedIndices,
}: StarProgressBarProps) {
  const earnedCount = earnedIndices.size;
  const percent = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

  return (
    <div
      className="rounded-3xl bg-white/95 p-4 shadow-sm ring-2 ring-sky-100"
      role="region"
      aria-label={`Session progress: ${earnedCount} of ${total} stars earned`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StarIcon filled active={false} />
          <span className="text-lg font-black text-slate-900">
            {earnedCount} / {total} Stars
          </span>
        </div>

        <div className="hidden h-4 flex-1 overflow-hidden rounded-full bg-slate-100 sm:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <span className="rounded-full bg-sky-100 px-3.5 py-1 text-sm font-extrabold text-sky-900">
          {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Visual star slots (non-button so kids don't accidentally skip exercises) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-between">
        {Array.from({ length: total }).map((_, idx) => {
          const isEarned = earnedIndices.has(idx);
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={idx}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12 ${
                isCurrent
                  ? "scale-110 bg-sky-100 ring-4 ring-sky-400 shadow-sm"
                  : isEarned
                  ? "bg-amber-50 ring-2 ring-amber-300"
                  : "bg-slate-50"
              }`}
            >
              <StarIcon filled={isEarned} active={isCurrent} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
