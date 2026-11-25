"use client";

import type { ReactNode } from "react";

/**
 * Custom storybook inline SVG fragments for P2 literacy words & Northern Ireland
 * collectible stickers (ship, chip, moth, ring, frog, stop, tent, step, puffin,
 * digger, causeway, t-rex). Returns null when key is not in this bank.
 */
export function renderP2OrStickerSvg(key: string): ReactNode | null {
  switch (key) {
    case "ship":
      return (
        <g>
          <path d="M10 62 Q25 56 40 62 Q55 68 70 62" stroke="#38BDF8" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M14 48 L66 48 L58 62 L22 62 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.8" strokeLinejoin="round" />
          <rect x="24" y="34" width="32" height="14" rx="3" fill="#F8FAFC" stroke="#334155" strokeWidth="2.5" />
          <rect x="30" y="20" width="9" height="14" rx="2" fill="#EF4444" stroke="#991B1B" strokeWidth="2.2" />
          <rect x="43" y="24" width="9" height="10" rx="2" fill="#F59E0B" stroke="#92400E" strokeWidth="2.2" />
          <circle cx="32" cy="41" r="2.5" fill="#38BDF8" />
          <circle cx="40" cy="41" r="2.5" fill="#38BDF8" />
          <circle cx="48" cy="41" r="2.5" fill="#38BDF8" />
        </g>
      );

    case "chip":
      return (
        <g>
          <rect x="24" y="14" width="8" height="32" rx="3" fill="#FACC15" stroke="#B45309" strokeWidth="2.4" transform="rotate(-10 28 30)" />
          <rect x="36" y="11" width="8" height="36" rx="3" fill="#FDE047" stroke="#B45309" strokeWidth="2.4" />
          <rect x="48" y="15" width="8" height="32" rx="3" fill="#FACC15" stroke="#B45309" strokeWidth="2.4" transform="rotate(10 52 30)" />
          <path d="M19 36 L61 36 L55 67 L25 67 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="40" cy="52" r="7" fill="#FEF08A" />
        </g>
      );

    case "moth":
      return (
        <g>
          <path d="M38 40 C22 18 8 24 14 44 C18 54 28 54 38 48 Z" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="2.8" />
          <path d="M42 40 C58 18 72 24 66 44 C62 54 52 54 42 48 Z" fill="#C4B5FD" stroke="#6D28D9" strokeWidth="2.8" />
          <circle cx="24" cy="36" r="4.5" fill="#FDE047" />
          <circle cx="56" cy="36" r="4.5" fill="#FDE047" />
          <ellipse cx="40" cy="44" rx="5.5" ry="15" fill="#78350F" />
          <path d="M37 29 Q32 19 28 21" stroke="#78350F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M43 29 Q48 19 52 21" stroke="#78350F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );

    case "ring":
      return (
        <g>
          <circle cx="40" cy="46" r="21" fill="none" stroke="#F59E0B" strokeWidth="9" />
          <circle cx="40" cy="46" r="21" fill="none" stroke="#FDE047" strokeWidth="3.5" />
          <polygon points="40,12 52,23 40,34 28,23" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.6" strokeLinejoin="round" />
        </g>
      );

    case "frog":
      return (
        <g>
          <circle cx="27" cy="25" r="9" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="53" cy="25" r="9" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="27" cy="25" r="4" fill="#FFFFFF" />
          <circle cx="53" cy="25" r="4" fill="#FFFFFF" />
          <circle cx="28" cy="25" r="2" fill="#0F172A" />
          <circle cx="54" cy="25" r="2" fill="#0F172A" />
          <ellipse cx="40" cy="46" rx="26" ry="20" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <ellipse cx="40" cy="52" rx="16" ry="10" fill="#BBF7D0" />
          <path d="M27 46 Q40 56 53 46" stroke="#14532D" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );

    case "stop":
      return (
        <g>
          <polygon
            points="27,10 53,10 70,27 70,53 53,70 27,70 10,53 10,27"
            fill="#EF4444"
            stroke="#FFFFFF"
            strokeWidth="4"
          />
          <polygon
            points="27,10 53,10 70,27 70,53 53,70 27,70 10,53 10,27"
            fill="none"
            stroke="#991B1B"
            strokeWidth="2.5"
          />
          <text x="40" y="47" textAnchor="middle" fontSize="18" fontWeight="900" fill="#FFFFFF">
            STOP
          </text>
        </g>
      );

    case "tent":
      return (
        <g>
          <polygon points="40,14 70,64 10,64" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="40,34 52,64 28,64" fill="#1E293B" />
          <line x1="40" y1="8" x2="40" y2="16" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
          <polygon points="40,8 52,12 40,16" fill="#FACC15" />
        </g>
      );

    case "step":
      return (
        <g>
          <path d="M12 66 L12 52 L30 52 L30 36 L48 36 L48 20 L68 20 L68 66 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" strokeLinejoin="round" />
          <path d="M20 42 L34 28" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <polygon points="37,25 27,26 35,34" fill="#F59E0B" />
        </g>
      );

    case "puffin":
      return (
        <g>
          {/* Northern Ireland Rathlin Island Puffin */}
          <ellipse cx="40" cy="49" rx="20" ry="22" fill="#0F172A" />
          <ellipse cx="40" cy="53" rx="13" ry="16" fill="#FFFFFF" />
          <circle cx="40" cy="27" r="14" fill="#0F172A" />
          <ellipse cx="42" cy="28" rx="9" ry="8" fill="#F8FAFC" />
          <circle cx="41" cy="26" r="2.6" fill="#0F172A" />
          {/* Iconic colourful puffin beak */}
          <path d="M49 23 L67 28 L50 35 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
          <path d="M49 24 L56 26 L56 33 L49 34 Z" fill="#FACC15" />
          {/* Orange webbed feet */}
          <path d="M29 69 L24 74 L35 74 Z" fill="#F97316" />
          <path d="M51 69 L45 74 L56 74 Z" fill="#F97316" />
        </g>
      );

    case "digger":
      return (
        <g>
          {/* Yellow Construction Digger */}
          <path d="M50 34 L64 20 L70 36" fill="none" stroke="#B45309" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M64 36 L75 38 L71 51 L60 47 Z" fill="#64748B" stroke="#1E293B" strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="16" y="24" width="26" height="22" rx="4" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
          <rect x="21" y="28" width="16" height="12" rx="2" fill="#BAE6FD" />
          <rect x="12" y="44" width="40" height="14" rx="4" fill="#EAB308" stroke="#B45309" strokeWidth="3" />
          <rect x="12" y="56" width="42" height="12" rx="6" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="21" cy="62" r="3.5" fill="#CBD5E1" />
          <circle cx="33" cy="62" r="3.5" fill="#CBD5E1" />
          <circle cx="45" cy="62" r="3.5" fill="#CBD5E1" />
        </g>
      );

    case "causeway":
      return (
        <g>
          {/* Giant's Causeway hexagonal basalt columns & sea */}
          <rect x="8" y="54" width="64" height="18" rx="6" fill="#38BDF8" />
          <polygon points="16,58 16,38 25,33 34,38 34,58" fill="#64748B" stroke="#334155" strokeWidth="2.4" />
          <polygon points="31,60 31,26 40,21 49,26 49,60" fill="#475569" stroke="#1E293B" strokeWidth="2.4" />
          <polygon points="46,58 46,34 55,29 64,34 64,58" fill="#64748B" stroke="#334155" strokeWidth="2.4" />
          <path d="M40 8 L42.5 14 L49 14.5 L44 18.5 L45.5 24.5 L40 21 L34.5 24.5 L36 18.5 L31 14.5 L37.5 14 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        </g>
      );

    case "t-rex":
      return (
        <g>
          <path d="M22 64 L22 44 C22 30 34 22 48 22 L62 22 C67 22 68 32 62 34 L50 34 L50 48 C50 58 44 64 36 64 Z" fill="#22C55E" stroke="#15803D" strokeWidth="3" strokeLinejoin="round" />
          <path d="M12 58 L24 48 L24 62 Z" fill="#16A34A" stroke="#15803D" strokeWidth="2.4" />
          <circle cx="53" cy="27" r="2.5" fill="#0F172A" />
          <path d="M54 34 L57 38 L60 34" fill="#FFFFFF" />
          <rect x="28" y="62" width="7" height="10" rx="2" fill="#15803D" />
          <rect x="40" y="62" width="7" height="10" rx="2" fill="#15803D" />
        </g>
      );

    default:
      return null;
  }
}
