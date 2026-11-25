"use client";

export type MascotMood = "idle" | "thinking" | "encouraging" | "celebrating";

interface SparkyMascotProps {
  mood: MascotMood;
  message?: string;
  onTap?: () => void;
  size?: "sm" | "md";
}

const MOOD_RING: Record<MascotMood, string> = {
  idle: "bg-sky-100 ring-sky-200",
  thinking: "bg-violet-100 ring-violet-300",
  encouraging: "bg-amber-100 ring-amber-300",
  celebrating: "bg-emerald-100 ring-emerald-300",
};

const MOOD_LABEL: Record<MascotMood, string> = {
  idle: "Sparky is ready to play",
  thinking: "Sparky is thinking with you",
  encouraging: "Sparky says have another go",
  celebrating: "Sparky is celebrating your star",
};

/**
 * Friendly inline SVG fox-spark mascot ("Sparky") with four expressive states:
 * idle, thinking, encouraging, and celebrating.
 */
export function SparkyMascot({
  mood,
  message,
  onTap,
  size = "md",
}: SparkyMascotProps) {
  const dim = size === "sm" ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onTap}
        aria-label={MOOD_LABEL[mood]}
        className={`touch-card relative flex shrink-0 items-center justify-center rounded-3xl p-1.5 shadow-sm ring-4 transition-all hover:scale-105 ${dim} ${MOOD_RING[mood]}`}
      >
        <svg
          viewBox="0 0 96 96"
          className="h-full w-full"
          role="img"
          aria-hidden="true"
        >
          {/* Celebration sparkles */}
          {mood === "celebrating" && (
            <g className="animate-pulse">
              <path
                d="M14 18 L17 11 L20 18 L27 21 L20 24 L17 31 L14 24 L7 21 Z"
                fill="#F59E0B"
              />
              <path
                d="M78 14 L80 9 L82 14 L87 16 L82 18 L80 23 L78 18 L73 16 Z"
                fill="#10B981"
              />
              <circle cx="84" cy="36" r="3.5" fill="#FBBF24" />
            </g>
          )}

          {/* Thinking dots */}
          {mood === "thinking" && (
            <g>
              <circle cx="78" cy="18" r="5" fill="#8B5CF6" opacity="0.85" />
              <circle cx="85" cy="10" r="3" fill="#A78BFA" />
            </g>
          )}

          {/* Encouraging heart */}
          {mood === "encouraging" && (
            <path
              d="M79 22 C79 18 74 16 72 20 C70 16 65 18 65 22 C65 26 72 30 72 30 C72 30 79 26 79 22 Z"
              fill="#F43F5E"
            />
          )}

          {/* Left & Right Fox Ears */}
          <path
            d="M22 44 L17 15 L41 30 Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M24 38 L22 22 L35 31 Z" fill="#FED7AA" />

          <path
            d="M74 44 L79 15 L55 30 Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="2.5"
            strokeLinejoin="round"
            transform={mood === "thinking" ? "rotate(8 68 34)" : undefined}
          />
          <path
            d="M72 38 L74 22 L61 31 Z"
            fill="#FED7AA"
            transform={mood === "thinking" ? "rotate(8 68 34)" : undefined}
          />

          {/* Main Head */}
          <ellipse
            cx="48"
            cy="55"
            rx="31"
            ry="27"
            fill="#FB923C"
            stroke="#9A3412"
            strokeWidth="2.5"
          />

          {/* Cream Cheeks & Chin */}
          <path
            d="M21 59 C24 74 36 81 48 81 C60 81 72 74 75 59 C67 56 59 61 48 63 C37 61 29 56 21 59 Z"
            fill="#FFF7ED"
          />

          {/* Forehead Star Badge */}
          <path
            d="M48 33 L50.2 37.8 L55.4 38.4 L51.5 41.9 L52.6 47 L48 44.3 L43.4 47 L44.5 41.9 L40.6 38.4 L45.8 37.8 Z"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth="1.2"
          />

          {/* Eyes per mood */}
          {mood === "celebrating" ? (
            <g
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            >
              <path d="M31 55 Q36 48 41 55" />
              <path d="M55 55 Q60 48 65 55" />
            </g>
          ) : mood === "thinking" ? (
            <g>
              <circle cx="36" cy="54" r="5" fill="#1E293B" />
              <circle cx="38" cy="51.5" r="1.8" fill="#FFFFFF" />
              <circle cx="60" cy="54" r="5" fill="#1E293B" />
              <circle cx="62" cy="51.5" r="1.8" fill="#FFFFFF" />
              <path
                d="M31 46 L41 47"
                stroke="#9A3412"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M55 47 Q60 43 65 45"
                stroke="#9A3412"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            <g>
              <circle cx="36" cy="55" r="5" fill="#1E293B" />
              <circle cx="34.5" cy="53" r="1.8" fill="#FFFFFF" />
              <circle cx="60" cy="55" r="5" fill="#1E293B" />
              <circle cx="58.5" cy="53" r="1.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="27" cy="63" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.7" />
          <ellipse cx="69" cy="63" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.7" />

          {/* Nose */}
          <ellipse cx="48" cy="63" rx="4.5" ry="3.2" fill="#1E293B" />

          {/* Mouth per mood */}
          {mood === "celebrating" && (
            <path
              d="M39 68 Q48 79 57 68 Z"
              fill="#F43F5E"
              stroke="#1E293B"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          )}
          {mood === "idle" && (
            <path
              d="M41 69 Q48 75 55 69"
              stroke="#1E293B"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {mood === "encouraging" && (
            <path
              d="M42 70 Q48 74 54 70"
              stroke="#1E293B"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {mood === "thinking" && (
            <path
              d="M44 71 Q48 69 53 71"
              stroke="#1E293B"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Raised celebrating paws */}
          {mood === "celebrating" && (
            <g>
              <circle
                cx="16"
                cy="66"
                r="7"
                fill="#FB923C"
                stroke="#9A3412"
                strokeWidth="2"
              />
              <circle
                cx="80"
                cy="66"
                r="7"
                fill="#FB923C"
                stroke="#9A3412"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </button>

      {message && (
        <div className="hidden rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 shadow-sm ring-2 ring-sky-100 md:block">
          {message}
        </div>
      )}
    </div>
  );
}
