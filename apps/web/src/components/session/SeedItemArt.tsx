"use client";

import type { UkCoin } from "@wee-sparks/curriculum-schema";
import { UkCoinSvg } from "./art/UkCoinSvg";
import { ShapeSvg } from "./art/ShapeSvg";
import { renderP2OrStickerSvg } from "./art/P2WordArt";
import { renderExtendedStickerOrWordSvg } from "./art/StickerPackArt";

interface SeedItemArtProps {
  itemKey: string;
  fallbackEmoji?: string;
  className?: string;
}

const UK_COINS = new Set<string>(["1p", "2p", "5p", "10p", "20p"]);
const SHAPE_KEYS = new Set<string>([
  "circle",
  "square",
  "triangle",
  "rectangle",
  "cube",
  "sphere",
  "cylinder",
  "cone",
]);

function normaliseItemKey(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  const slug = cleaned.includes("/")
    ? cleaned.split("/").pop() ?? cleaned
    : cleaned;
  return slug.replace(/\s+/g, "-");
}

/**
 * Custom offline inline SVG storybook visuals covering all P1 & P2 words,
 * 2D/3D shapes, UK coins (1p–20p), and Northern Ireland collectible stickers.
 */
export function SeedItemArt({
  itemKey,
  fallbackEmoji,
  className = "h-14 w-14 sm:h-16 sm:w-16",
}: SeedItemArtProps) {
  const key = normaliseItemKey(itemKey);

  if (UK_COINS.has(key)) {
    return <UkCoinSvg coin={key as UkCoin} className={className} />;
  }

  if (SHAPE_KEYS.has(key)) {
    return <ShapeSvg shape={key} className={className} />;
  }

  const p2Art = renderP2OrStickerSvg(key) ?? renderExtendedStickerOrWordSvg(key);
  if (p2Art) {
    return (
      <svg viewBox="0 0 80 80" className={className} role="img" aria-hidden="true">
        {p2Art}
      </svg>
    );
  }

  const renderP1Artwork = () => {
    switch (key) {
      case "sun":
        return (
          <g>
            <g stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round">
              <line x1="40" y1="7" x2="40" y2="16" />
              <line x1="40" y1="64" x2="40" y2="73" />
              <line x1="7" y1="40" x2="16" y2="40" />
              <line x1="64" y1="40" x2="73" y2="40" />
              <line x1="17" y1="17" x2="23" y2="23" />
              <line x1="57" y1="57" x2="63" y2="63" />
              <line x1="63" y1="17" x2="57" y2="23" />
              <line x1="23" y1="57" x2="17" y2="63" />
            </g>
            <circle cx="40" cy="40" r="19" fill="#FDE047" stroke="#D97706" strokeWidth="3" />
            <circle cx="34" cy="37" r="2.5" fill="#78350F" />
            <circle cx="46" cy="37" r="2.5" fill="#78350F" />
            <path d="M34 45 Q40 50 46 45" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );

      case "moon":
        return (
          <g>
            <path
              d="M52 14 C34 15 21 29 22 46 C23 62 39 72 56 66 C42 63 36 49 38 36 C40 25 45 18 52 14 Z"
              fill="#FEF08A"
              stroke="#CA8A04"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="56" cy="24" r="3" fill="#FDE047" />
            <circle cx="63" cy="36" r="2" fill="#FDE047" />
          </g>
        );

      case "rocket":
        return (
          <g>
            <path d="M40 10 C51 20 55 34 54 52 L26 52 C25 34 29 20 40 10 Z" fill="#F8FAFC" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
            <path d="M40 10 C46 16 49 21 50 26 L30 26 C31 21 34 16 40 10 Z" fill="#EF4444" />
            <circle cx="40" cy="36" r="7" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
            <path d="M26 42 L15 56 L26 54 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <path d="M54 42 L65 56 L54 54 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <path d="M33 54 L40 70 L47 54 Z" fill="#F59E0B" />
          </g>
        );

      case "comet":
        return (
          <g>
            <path d="M12 62 Q28 46 44 36 L48 44 Q32 54 18 68 Z" fill="#38BDF8" opacity="0.7" />
            <path d="M18 50 Q30 38 46 30 L50 38 Q36 46 24 56 Z" fill="#FDE047" opacity="0.85" />
            <circle cx="54" cy="28" r="14" fill="#F97316" stroke="#9A3412" strokeWidth="3" />
            <circle cx="50" cy="24" r="3.5" fill="#FDBA74" />
            <circle cx="59" cy="31" r="2.5" fill="#EA580C" />
          </g>
        );

      case "star":
      case "gold-star":
        return (
          <path
            d="M40 10 L48.5 28.2 L68.5 30.8 L53.8 44.6 L57.6 64.5 L40 54.8 L22.4 64.5 L26.2 44.6 L11.5 30.8 L31.5 28.2 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        );

      case "ant":
        return (
          <g>
            <g stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M26 30 L18 18" />
              <path d="M32 28 L29 16" />
              <path d="M32 48 L22 60" />
              <path d="M42 50 L40 64" />
              <path d="M52 50 L60 62" />
            </g>
            <circle cx="24" cy="39" r="9" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
            <circle cx="40" cy="44" r="8" fill="#B45309" stroke="#451A03" strokeWidth="2.5" />
            <ellipse cx="57" cy="46" rx="12" ry="10" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
            <circle cx="21" cy="37" r="2" fill="#FFFFFF" />
          </g>
        );

      case "taxi":
        return (
          <g>
            <rect x="31" y="21" width="18" height="8" rx="3" fill="#1E293B" />
            <path d="M20 42 L27 28 L53 28 L60 42 Z" fill="#BAE6FD" stroke="#B45309" strokeWidth="2.8" strokeLinejoin="round" />
            <rect x="11" y="40" width="58" height="19" rx="6" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
            <rect x="26" y="47" width="28" height="5" fill="#1E293B" />
            <circle cx="24" cy="60" r="7.5" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="56" cy="60" r="7.5" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
          </g>
        );

      case "bus":
      case "red-bus":
        return (
          <g>
            <rect x="10" y="18" width="60" height="40" rx="8" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <rect x="16" y="24" width="13" height="11" rx="2.5" fill="#E0F2FE" />
            <rect x="33" y="24" width="13" height="11" rx="2.5" fill="#E0F2FE" />
            <rect x="50" y="24" width="14" height="11" rx="2.5" fill="#E0F2FE" />
            <rect x="10" y="42" width="60" height="5" fill="#FDE047" />
            <circle cx="24" cy="60" r="7.5" fill="#1E293B" />
            <circle cx="24" cy="60" r="3" fill="#CBD5E1" />
            <circle cx="56" cy="60" r="7.5" fill="#1E293B" />
            <circle cx="56" cy="60" r="3" fill="#CBD5E1" />
          </g>
        );

      case "van":
        return (
          <g>
            <path d="M12 28 L50 28 L66 42 L66 57 L12 57 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" strokeLinejoin="round" />
            <path d="M48 32 L59 42 L48 42 Z" fill="#E0F2FE" />
            <rect x="18" y="34" width="22" height="10" rx="2.5" fill="#E0F2FE" />
            <circle cx="24" cy="59" r="7" fill="#1E293B" />
            <circle cx="54" cy="59" r="7" fill="#1E293B" />
          </g>
        );

      case "car":
        return (
          <g>
            <path d="M22 42 L29 27 L51 27 L58 42 Z" fill="#BAE6FD" stroke="#1D4ED8" strokeWidth="2.8" strokeLinejoin="round" />
            <rect x="11" y="40" width="58" height="18" rx="7" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
            <circle cx="24" cy="59" r="7" fill="#1E293B" />
            <circle cx="56" cy="59" r="7" fill="#1E293B" />
          </g>
        );

      case "pig":
        return (
          <g>
            <path d="M22 30 L16 17 L32 23 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M58 30 L64 17 L48 23 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="40" cy="44" r="24" fill="#FBCFE8" stroke="#BE185D" strokeWidth="3" />
            <circle cx="31" cy="38" r="3" fill="#1E293B" />
            <circle cx="49" cy="38" r="3" fill="#1E293B" />
            <ellipse cx="40" cy="49" rx="11" ry="8" fill="#F472B6" stroke="#BE185D" strokeWidth="2.2" />
            <circle cx="36" cy="49" r="2" fill="#831843" />
            <circle cx="44" cy="49" r="2" fill="#831843" />
          </g>
        );

      case "insect":
        return (
          <g>
            <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
              <line x1="34" y1="22" x2="27" y2="12" />
              <line x1="46" y1="22" x2="53" y2="12" />
              <line x1="20" y1="40" x2="11" y2="36" />
              <line x1="20" y1="50" x2="11" y2="54" />
              <line x1="60" y1="40" x2="69" y2="36" />
              <line x1="60" y1="50" x2="69" y2="54" />
            </g>
            <circle cx="40" cy="26" r="10" fill="#1E293B" />
            <ellipse cx="40" cy="48" rx="20" ry="20" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" />
            <line x1="40" y1="29" x2="40" y2="68" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="31" cy="43" r="3.5" fill="#1E293B" />
            <circle cx="49" cy="43" r="3.5" fill="#1E293B" />
            <circle cx="32" cy="56" r="3" fill="#1E293B" />
            <circle cx="48" cy="56" r="3" fill="#1E293B" />
          </g>
        );

      case "nest":
        return (
          <g>
            <ellipse cx="32" cy="36" rx="8" ry="10" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
            <ellipse cx="48" cy="36" rx="8" ry="10" fill="#A7F3D0" stroke="#059669" strokeWidth="2.5" />
            <path d="M12 42 C12 62 24 68 40 68 C56 68 68 62 68 42 Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
            <path d="M18 48 Q40 55 62 48" stroke="#FDE68A" strokeWidth="2.5" fill="none" />
            <path d="M22 57 Q40 63 58 57" stroke="#FDE68A" strokeWidth="2.5" fill="none" />
          </g>
        );

      case "egg":
      case "dinosaur-egg":
        return (
          <g>
            <path
              d="M40 12 C56 12 64 34 62 50 C60 63 51 69 40 69 C29 69 20 63 18 50 C16 34 24 12 40 12 Z"
              fill={key === "dinosaur-egg" ? "#BBF7D0" : "#FEF3C7"}
              stroke={key === "dinosaur-egg" ? "#15803D" : "#B45309"}
              strokeWidth="3"
            />
            <circle cx="32" cy="36" r="5" fill={key === "dinosaur-egg" ? "#22C55E" : "#FDE68A"} />
            <circle cx="48" cy="48" r="6" fill={key === "dinosaur-egg" ? "#16A34A" : "#FCD34D"} />
            <circle cx="36" cy="56" r="3.5" fill={key === "dinosaur-egg" ? "#4ADE80" : "#FDE68A"} />
          </g>
        );

      case "leaf":
        return (
          <g>
            <path d="M18 62 C16 32 36 14 64 16 C64 44 48 64 18 62 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="3" strokeLinejoin="round" />
            <path d="M16 64 L54 26" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case "rock":
        return (
          <g>
            <path d="M14 58 L20 34 L38 22 L58 28 L68 50 L58 62 L22 62 Z" fill="#94A3B8" stroke="#475569" strokeWidth="3" strokeLinejoin="round" />
            <path d="M26 42 L40 34 L50 40" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );

      case "sat":
        return (
          <g>
            <ellipse cx="40" cy="64" rx="28" ry="8" fill="#F472B6" stroke="#BE185D" strokeWidth="2.5" />
            <path d="M28 24 L25 13 L35 20 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
            <path d="M52 24 L55 13 L45 20 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
            <circle cx="40" cy="29" r="12" fill="#FBBF24" stroke="#92400E" strokeWidth="2.5" />
            <ellipse cx="40" cy="51" rx="14" ry="13" fill="#F59E0B" stroke="#92400E" strokeWidth="2.5" />
            <circle cx="36" cy="28" r="2" fill="#1E293B" />
            <circle cx="44" cy="28" r="2" fill="#1E293B" />
          </g>
        );

      case "pin":
        return (
          <g>
            <path d="M40 46 L40 70" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 44 L56 44 L48 28 L52 16 L28 16 L32 28 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3" strokeLinejoin="round" />
          </g>
        );

      case "tin":
        return (
          <g>
            <rect x="20" y="20" width="40" height="44" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
            <ellipse cx="40" cy="20" rx="20" ry="6" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />
            <rect x="20" y="34" width="40" height="18" fill="#38BDF8" />
            <circle cx="40" cy="43" r="5" fill="#FDE047" />
          </g>
        );

      case "tap":
        return (
          <g>
            <path d="M16 32 L46 32 C54 32 58 36 58 44 L48 44 C48 41 46 40 42 40 L16 40 Z" fill="#94A3B8" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
            <rect x="28" y="18" width="14" height="6" rx="3" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
            <rect x="33" y="24" width="4" height="8" fill="#475569" />
            <path d="M53 50 C53 50 61 59 61 64 C61 68 57 71 53 71 C49 71 45 68 45 64 C45 59 53 50 53 50 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
          </g>
        );

      case "pan":
        return (
          <g>
            <line x1="48" y1="42" x2="71" y2="28" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <circle cx="34" cy="46" r="21" fill="#475569" stroke="#0F172A" strokeWidth="3" />
            <circle cx="34" cy="46" r="14" fill="#64748B" />
            <circle cx="36" cy="45" r="6" fill="#FACC15" />
          </g>
        );

      case "nap":
        return (
          <g>
            <rect x="14" y="38" width="52" height="24" rx="10" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="3" />
            <text x="26" y="30" fontSize="16" fontWeight="900" fill="#4C1D95">Z</text>
            <text x="41" y="22" fontSize="13" fontWeight="900" fill="#6D28D9">z</text>
            <text x="52" y="16" fontSize="10" fontWeight="900" fill="#8B5CF6">z</text>
          </g>
        );

      case "satellite":
        return (
          <g>
            <rect x="8" y="28" width="18" height="24" rx="3" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
            <rect x="54" y="28" width="18" height="24" rx="3" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.5" />
            <line x1="26" y1="40" x2="31" y2="40" stroke="#475569" strokeWidth="3.5" />
            <line x1="49" y1="40" x2="54" y2="40" stroke="#475569" strokeWidth="3.5" />
            <rect x="31" y="26" width="18" height="28" rx="4" fill="#E2E8F0" stroke="#334155" strokeWidth="3" />
            <circle cx="40" cy="40" r="4" fill="#F59E0B" />
            <line x1="40" y1="16" x2="40" y2="26" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <circle cx="40" cy="14" r="3" fill="#EF4444" />
          </g>
        );

      case "tail":
        return (
          <g>
            <path d="M16 58 C24 38 42 26 62 24 C66 36 56 54 32 62 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="42" cy="42" r="4" fill="#16A34A" />
            <circle cx="53" cy="34" r="3" fill="#16A34A" />
            <circle cx="29" cy="50" r="3.5" fill="#16A34A" />
          </g>
        );

      case "newt":
        return (
          <g>
            <path d="M14 54 C24 44 36 36 52 38 C60 39 66 34 68 28" stroke="#16A34A" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle cx="58" cy="36" r="8" fill="#4ADE80" stroke="#15803D" strokeWidth="2.5" />
            <circle cx="61" cy="34" r="2" fill="#1E293B" />
            <circle cx="38" cy="41" r="2.5" fill="#F97316" />
            <circle cx="46" cy="39" r="2.5" fill="#F97316" />
          </g>
        );

      case "paddle":
        return (
          <g>
            <line x1="18" y1="18" x2="50" y2="50" stroke="#92400E" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M44 44 C52 40 66 48 66 64 C50 64 40 52 44 44 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="3" strokeLinejoin="round" />
          </g>
        );

      case "sit":
        return (
          <g>
            <rect x="24" y="14" width="32" height="26" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="3" />
            <rect x="20" y="40" width="40" height="9" rx="3" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />
            <line x1="26" y1="49" x2="26" y2="68" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <line x1="54" y1="49" x2="54" y2="68" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
          </g>
        );

      default:
        return null;
    }
  };

  const artwork = renderP1Artwork();
  if (!artwork) {
    // SVG-first emblem fallback so visuals stay consistent across all devices (zero OS emoji drift)
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        role="img"
        aria-hidden="true"
        data-fallback-emoji={fallbackEmoji ?? ""}
      >
        <circle cx="40" cy="40" r="32" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3.2" />
        <path
          d="M40 16 L46.2 30.2 L61.5 32 L50 42.4 L53 57.5 L40 49.8 L27 57.5 L30 42.4 L18.5 32 L33.8 30.2 Z"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-hidden="true">
      {artwork}
    </svg>
  );
}
