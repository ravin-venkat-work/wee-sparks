"use client";

interface AudioReplayButtonProps {
  onClick: () => void;
  isPlaying?: boolean;
  label?: string;
  size?: "lg" | "md";
  ariaLabel?: string;
}

/**
 * Tablet-first Foundation Stage audio replay button (>= 80px x 80px in primary mode)
 * with animated sound-wave feedback while speaking.
 */
export function AudioReplayButton({
  onClick,
  isPlaying = false,
  label,
  size = "lg",
  ariaLabel = "Listen again",
}: AudioReplayButtonProps) {
  const sizeClasses =
    size === "lg"
      ? "min-h-[84px] min-w-[84px] px-6 py-4 text-4xl rounded-3xl"
      : "min-h-[64px] min-w-[64px] px-4 py-3 text-2xl rounded-2xl";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={isPlaying}
      className={`touch-card relative inline-flex items-center justify-center gap-3 bg-amber-400 font-extrabold text-slate-900 shadow-md ring-4 transition-all hover:bg-amber-300 focus:outline-none focus:ring-sky-500 ${sizeClasses} ${
        isPlaying
          ? "scale-105 ring-amber-200 shadow-amber-300/70"
          : "ring-amber-200/80"
      }`}
    >
      {isPlaying && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-ping rounded-3xl bg-amber-300/50"
        />
      )}
      <span className="relative" aria-hidden="true">
        {isPlaying ? "🔊" : "🔈"}
      </span>
      {label && (
        <span className="relative text-lg font-extrabold tracking-tight sm:text-xl">
          {label}
        </span>
      )}
    </button>
  );
}
