"use client";

interface StarProgressBarProps {
  total: number;
  currentIndex: number;
  earnedIndices: ReadonlySet<number>;
}

/**
 * Hexagonal Giant's Causeway basalt stepping stone SVG tile.
 * Earned stones glow golden with a star; current stone pulses with a sky beacon.
 */
function CausewayStone({
  earned,
  current,
  stepNumber,
}: {
  earned: boolean;
  current: boolean;
  stepNumber: number;
}) {
  return (
    <div
      className={`relative flex flex-col items-center transition-transform duration-300 ${
        current ? "scale-110 -translate-y-1" : earned ? "animate-stone-pop" : ""
      }`}
    >
      <svg
        viewBox="0 0 56 52"
        className="h-12 w-14 sm:h-14 sm:w-16"
        aria-hidden="true"
      >
        {/* Basalt 3D column side */}
        <polygon
          points="8,24 28,36 48,24 48,38 28,50 8,38"
          fill={earned ? "#B45309" : current ? "#0284C7" : "#475569"}
        />
        {/* Hexagonal top face */}
        <polygon
          points="28,4 48,15 48,26 28,37 8,26 8,15"
          fill={earned ? "#FDE047" : current ? "#BAE6FD" : "#CBD5E1"}
          stroke={earned ? "#CA8A04" : current ? "#0369A1" : "#64748B"}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {earned ? (
          <path
            d="M28 11 L30.8 17 L37.2 17.8 L32.4 22 L33.6 28.4 L28 25.2 L22.4 28.4 L23.6 22 L18.8 17.8 L25.2 17 Z"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="1.2"
          />
        ) : (
          <text
            x="28"
            y="25"
            textAnchor="middle"
            fontSize="13"
            fontWeight="900"
            fill={current ? "#0C4A6E" : "#475569"}
          >
            {stepNumber}
          </text>
        )}
      </svg>

      {current && (
        <span
          className="absolute -top-2.5 text-sm leading-none animate-bounce"
          aria-hidden="true"
        >
          🦊
        </span>
      )}
    </div>
  );
}

/**
 * Northern Ireland Giant's Causeway basalt stepping-stone progress path
 * across gentle coastal waves, tracking stars earned across the session.
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
      className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-100 via-cyan-50 to-sky-100 p-4 shadow-sm ring-2 ring-sky-200"
      role="region"
      aria-label={`Giant's Causeway progress: ${earnedCount} of ${total} stars earned`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            ⭐
          </span>
          <span className="text-base font-black text-slate-900 sm:text-lg">
            {earnedCount} / {total} Stars
          </span>
          <span className="hidden rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-extrabold text-sky-900 sm:inline">
            Giant&apos;s Causeway Path
          </span>
        </div>

        <div className="hidden h-3.5 flex-1 overflow-hidden rounded-full bg-white/80 ring-1 ring-sky-200 sm:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <span className="rounded-full bg-white px-3.5 py-1 text-sm font-extrabold text-sky-900 shadow-sm">
          Step {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Stepping-stone hexagonal trail */}
      <div className="relative flex flex-wrap items-center justify-around gap-1.5 rounded-2xl bg-sky-200/45 px-3 py-2.5">
        {Array.from({ length: total }).map((_, idx) => {
          const isEarned = earnedIndices.has(idx);
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              aria-current={isCurrent ? "step" : undefined}
              className={idx % 2 === 1 ? "translate-y-1" : "-translate-y-0.5"}
            >
              <CausewayStone
                earned={isEarned}
                current={isCurrent}
                stepNumber={idx + 1}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
