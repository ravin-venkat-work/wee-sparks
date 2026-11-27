"use client";

import { motion, useReducedMotion } from "motion/react";
import type {
  CompanionAvatarId,
  StoryCompanionMood,
  StoryIllustrationKey,
} from "@wee-sparks/curriculum-schema";
import { CompanionAvatarSvg } from "../avatars/CompanionAvatarSvg";

interface StorySceneIllustrationProps {
  illustration: StoryIllustrationKey;
  companionAvatarId: CompanionAvatarId;
  companionMood?: StoryCompanionMood;
  compact?: boolean;
  className?: string;
}

/**
 * Offline-first inline SVG storybook scene renderer with gentle motion
 * (automatically static under prefers-reduced-motion) and embedded animated companion.
 */
export function StorySceneIllustration({
  illustration,
  companionAvatarId,
  companionMood = "idle",
  compact = false,
  className = "",
}: StorySceneIllustrationProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ring-2 ring-sky-200/80 ${
        compact ? "h-32 w-full" : "h-48 w-full sm:h-56"
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 360 190"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {illustration === "causeway-shore" && (
          <g>
            <defs>
              <linearGradient id="causewaySky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#FEF3C7" />
              </linearGradient>
            </defs>
            <rect width="360" height="190" fill="url(#causewaySky)" />
            {/* Golden sun */}
            <circle cx="295" cy="44" r="24" fill="#FDE047" />
            <circle cx="295" cy="44" r="32" fill="#FDE047" opacity="0.25" />
            {/* Sea */}
            <path
              d="M0 116 Q45 106 90 116 T180 116 T270 116 T360 116 L360 190 L0 190 Z"
              fill="#0284C7"
            />
            <path
              d="M0 132 Q50 124 100 132 T200 132 T300 132 T360 132 L360 190 L0 190 Z"
              fill="#0369A1"
            />
            {/* Giant's Causeway hexagonal basalt stepping stones */}
            {[
              { x: 24, y: 122, h: 68, top: "#94A3B8", side: "#475569" },
              { x: 64, y: 132, h: 58, top: "#CBD5E1", side: "#64748B" },
              { x: 104, y: 142, h: 48, top: "#E2E8F0", side: "#64748B" },
              { x: 144, y: 136, h: 54, top: "#FDE047", side: "#B45309" },
              { x: 184, y: 146, h: 44, top: "#CBD5E1", side: "#64748B" },
              { x: 224, y: 138, h: 52, top: "#94A3B8", side: "#475569" },
            ].map((col, idx) => (
              <g key={idx}>
                <rect
                  x={col.x}
                  y={col.y}
                  width="36"
                  height={col.h}
                  rx="4"
                  fill={col.side}
                />
                <polygon
                  points={`${col.x + 18},${col.y - 10} ${col.x + 36},${col.y} ${col.x + 18},${col.y + 10} ${col.x},${col.y}`}
                  fill={col.top}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              </g>
            ))}
            {/* Glowing sky stars */}
            <circle cx="72" cy="34" r="4" fill="#F59E0B" />
            <circle cx="136" cy="24" r="3" fill="#F59E0B" />
            <circle cx="212" cy="38" r="4.5" fill="#F59E0B" />
          </g>
        )}

        {illustration === "starlight-launch" && (
          <g>
            <defs>
              <linearGradient id="spaceSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="100%" stopColor="#312E81" />
              </linearGradient>
            </defs>
            <rect width="360" height="190" fill="url(#spaceSky)" />
            {/* Twinkling stars */}
            {[
              [40, 32, 3],
              [92, 54, 2.5],
              [148, 28, 3.5],
              [224, 42, 3],
              [290, 26, 2.5],
              [326, 62, 3.5],
              [62, 92, 2],
            ].map(([cx, cy, r], idx) => (
              <circle key={idx} cx={cx} cy={cy} r={r} fill="#FDE047" />
            ))}
            {/* Ringed planet */}
            <circle cx="292" cy="78" r="22" fill="#38BDF8" />
            <ellipse
              cx="292"
              cy="78"
              rx="36"
              ry="8"
              fill="none"
              stroke="#BAE6FD"
              strokeWidth="4"
              transform="rotate(-14 292 78)"
            />
            {/* Lunar hills */}
            <path
              d="M0 144 Q90 118 180 142 T360 134 L360 190 L0 190 Z"
              fill="#6366F1"
            />
            <circle cx="96" cy="160" r="14" fill="#4F46E5" />
            <circle cx="240" cy="164" r="18" fill="#4F46E5" />
          </g>
        )}

        {illustration === "dino-valley" && (
          <g>
            <rect width="360" height="190" fill="#E0F2FE" />
            <circle cx="66" cy="40" r="20" fill="#FDE047" />
            {/* Soft clouds */}
            <g fill="#FFFFFF" opacity="0.92">
              <ellipse cx="164" cy="38" rx="26" ry="12" />
              <ellipse cx="182" cy="34" rx="18" ry="11" />
              <ellipse cx="292" cy="46" rx="24" ry="11" />
            </g>
            {/* Glens green hills */}
            <path
              d="M0 124 Q85 84 185 118 T360 108 L360 190 L0 190 Z"
              fill="#4ADE80"
            />
            <path
              d="M0 144 Q110 120 220 148 T360 138 L360 190 L0 190 Z"
              fill="#22C55E"
            />
            {/* Friendly fern fronds */}
            <path
              d="M42 186 Q34 150 56 132 M42 186 Q54 156 72 146"
              stroke="#15803D"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M312 186 Q300 152 324 134 M312 186 Q326 158 342 148"
              stroke="#15803D"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {illustration === "rathlin-harbour" && (
          <g>
            <defs>
              <linearGradient id="harbourSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#E0F2FE" />
              </linearGradient>
            </defs>
            <rect width="360" height="190" fill="url(#harbourSky)" />
            {/* Cliff & Rathlin Lighthouse */}
            <path
              d="M236 128 Q266 96 314 102 L360 102 L360 154 L224 154 Z"
              fill="#16A34A"
            />
            <rect x="282" y="46" width="22" height="58" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
            <rect x="282" y="64" width="22" height="14" fill="#EF4444" />
            <rect x="282" y="88" width="22" height="12" fill="#EF4444" />
            <polygon points="278,46 293,32 308,46" fill="#EF4444" />
            <circle cx="293" cy="52" r="5" fill="#FDE047" />
            {/* Harbour waves */}
            <path
              d="M0 132 Q45 122 90 132 T180 132 T270 132 T360 132 L360 190 L0 190 Z"
              fill="#0284C7"
            />
            <path
              d="M0 154 Q55 144 110 154 T220 154 T360 154 L360 190 L0 190 Z"
              fill="#0369A1"
            />
            {/* Little NI ferry boat */}
            <path d="M52 136 L118 136 L108 152 L62 152 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
            <rect x="68" y="122" width="32" height="14" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.8" />
            <rect x="78" y="114" width="10" height="8" rx="2" fill="#EF4444" />
          </g>
        )}

        {illustration === "belfast-depot" && (
          <g>
            <rect width="360" height="190" fill="#FEF3C7" />
            {/* Rainbow arc */}
            <path d="M40 140 A140 120 0 0 1 320 140" fill="none" stroke="#FB7185" strokeWidth="10" opacity="0.65" />
            <path d="M52 140 A128 108 0 0 1 308 140" fill="none" stroke="#FBBF24" strokeWidth="10" opacity="0.65" />
            <path d="M64 140 A116 96 0 0 1 296 140" fill="none" stroke="#38BDF8" strokeWidth="10" opacity="0.65" />
            {/* Brick depot arch */}
            <rect x="220" y="76" width="112" height="72" rx="10" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
            <path d="M244 148 L244 108 A32 26 0 0 1 308 108 L308 148 Z" fill="#FEF9C3" />
            {/* Cobble road */}
            <rect x="0" y="146" width="360" height="44" fill="#64748B" />
            <line x1="20" y1="168" x2="340" y2="168" stroke="#FDE047" strokeWidth="4" strokeDasharray="18 14" />
          </g>
        )}

        {illustration === "treasure-cove" && (
          <g>
            <defs>
              <linearGradient id="coveSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#BAE6FD" />
              </linearGradient>
            </defs>
            <rect width="360" height="190" fill="url(#coveSky)" />
            {/* Sparkling sea */}
            <rect x="0" y="108" width="360" height="40" fill="#0EA5E9" />
            {/* Golden beach */}
            <path d="M0 132 Q180 112 360 136 L360 190 L0 190 Z" fill="#FCD34D" />
            {/* Treasure chest */}
            <rect x="242" y="114" width="64" height="42" rx="8" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
            <rect x="242" y="128" width="64" height="8" fill="#F59E0B" />
            <rect x="268" y="124" width="12" height="16" rx="3" fill="#FDE047" stroke="#92400E" strokeWidth="1.5" />
            {/* Gleaming stars */}
            <path d="M268 88 L272 78 L276 88 L286 92 L276 96 L272 106 L268 96 L258 92 Z" fill="#F59E0B" />
            <circle cx="298" cy="86" r="4" fill="#10B981" />
            <circle cx="246" cy="96" r="3.5" fill="#F43F5E" />
          </g>
        )}
      </svg>

      {/* Embedded animated companion avatar resting inside the illustrated scene */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { y: 0 }
            : { y: [0, -4, 0] }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-2 left-4 flex items-center justify-center rounded-3xl bg-white/90 p-1.5 shadow-md ring-2 ring-white ${
          compact ? "h-16 w-16" : "h-24 w-24 sm:h-28 sm:w-28"
        }`}
      >
        <CompanionAvatarSvg
          avatarId={companionAvatarId}
          mood={companionMood}
          animated={!prefersReducedMotion}
        />
      </motion.div>
    </div>
  );
}
