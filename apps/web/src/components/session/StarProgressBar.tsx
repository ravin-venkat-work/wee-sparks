"use client";

interface StarProgressBarProps {
  total: number;
  currentIndex: number;
  earnedIndices: ReadonlySet<number>;
  onSelectExercise?: (index: number) => void;
}

/**
 * Kid-friendly star progress track for tablet sessions.
 * Displays earned gold stars, active spotlight ring, and tap-to-jump navigation.
 */
export function StarProgressBar({
  total,
  currentIndex,
  earnedIndices,
  onSelectExercise,
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
          <span className="text-2xl" aria-hidden="true">
            ⭐
          </span>
          <span className="text-lg font-extrabold text-slate-900">
            {earnedCount} / {total} Stars
          </span>
        </div>

        {/* Continuous fill bar */}
        <div className="hidden h-4 flex-1 overflow-hidden rounded-full bg-slate-100 sm:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-900">
          {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Individual tactile star nodes */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
        {Array.from({ length: total }).map((_, idx) => {
          const isEarned = earnedIndices.has(idx);
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectExercise?.(idx)}
              aria-label={`Exercise ${idx + 1}${isEarned ? ", star earned" : ""}${
                isCurrent ? ", current" : ""
              }`}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-bold transition-all sm:h-12 sm:w-12 sm:text-2xl ${
                isCurrent
                  ? "scale-110 bg-sky-100 ring-4 ring-sky-400 shadow-sm"
                  : isEarned
                  ? "bg-amber-100 ring-2 ring-amber-300 hover:bg-amber-200"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <span className={isEarned ? "animate-star-pop" : "opacity-45"}>
                {isEarned ? "⭐" : "☆"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
