"use client";

import type { ReactNode } from "react";

/**
 * Extended custom inline SVG art for the 28-sticker collection and common
 * P1/P2 vocabulary words so every kid-facing card renders crisp, consistent
 * artwork across all devices without relying on platform emoji fonts.
 */
export function renderExtendedStickerOrWordSvg(key: string): ReactNode | null {
  switch (key) {
    case "lighthouse":
      return (
        <g>
          <path d="M10 62 Q40 54 70 62 L70 72 L10 72 Z" fill="#0284C7" />
          <polygon points="30,62 34,26 46,26 50,62" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.6" />
          <polygon points="32.5,38 47.5,38 48.5,48 31.5,48" fill="#EF4444" />
          <rect x="33" y="18" width="14" height="8" rx="2" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
          <polygon points="30,18 40,9 50,18" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          <path d="M51 22 L68 16 M51 24 L68 28" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case "shamrock":
      return (
        <g>
          <path d="M40 44 Q42 60 32 70" stroke="#15803D" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="24" r="13" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <circle cx="25" cy="40" r="13" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <circle cx="55" cy="40" r="13" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <circle cx="40" cy="37" r="6" fill="#4ADE80" />
        </g>
      );

    case "rainbow":
      return (
        <g>
          <path d="M12 58 A28 28 0 0 1 68 58" fill="none" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
          <path d="M18 58 A22 22 0 0 1 62 58" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
          <path d="M24 58 A16 16 0 0 1 56 58" fill="none" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />
          <path d="M30 58 A10 10 0 0 1 50 58" fill="none" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="18" cy="60" rx="10" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <ellipse cx="62" cy="60" rx="10" ry="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        </g>
      );

    case "planet":
      return (
        <g>
          <circle cx="40" cy="40" r="18" fill="#6366F1" stroke="#312E81" strokeWidth="3" />
          <ellipse
            cx="40"
            cy="40"
            rx="32"
            ry="9"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="5"
            transform="rotate(-18 40 40)"
          />
          <circle cx="33" cy="34" r="3.5" fill="#A5B4FC" />
          <circle cx="47" cy="45" r="2.5" fill="#A5B4FC" />
        </g>
      );

    case "astronaut":
      return (
        <g>
          <rect x="24" y="46" width="32" height="22" rx="10" fill="#F8FAFC" stroke="#334155" strokeWidth="2.8" />
          <circle cx="40" cy="32" r="19" fill="#F8FAFC" stroke="#334155" strokeWidth="3" />
          <rect x="27" y="22" width="26" height="19" rx="9" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.4" />
          <circle cx="35" cy="31" r="2.5" fill="#0F172A" />
          <circle cx="45" cy="31" r="2.5" fill="#0F172A" />
          <path d="M36 36 Q40 39 44 36" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="34" y="53" width="12" height="8" rx="2" fill="#F59E0B" />
        </g>
      );

    case "telescope":
      return (
        <g>
          <line x1="40" y1="42" x2="24" y2="68" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="42" x2="56" y2="68" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="42" x2="40" y2="68" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <rect
            x="16"
            y="24"
            width="44"
            height="14"
            rx="5"
            fill="#0284C7"
            stroke="#0C4A6E"
            strokeWidth="2.8"
            transform="rotate(-22 38 31)"
          />
          <circle cx="60" cy="21" r="5" fill="#FDE047" />
        </g>
      );

    case "triceratops":
      return (
        <g>
          <path d="M20 56 C18 36 30 28 46 32 L58 38 C64 42 64 56 54 58 L24 58 Z" fill="#10B981" stroke="#065F46" strokeWidth="2.8" />
          <path d="M44 20 C56 18 64 26 60 40 L46 38 Z" fill="#34D399" stroke="#065F46" strokeWidth="2.6" />
          <path d="M56 30 L69 24 M58 37 L70 35" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="51" cy="36" r="2.5" fill="#0F172A" />
          <rect x="26" y="56" width="7" height="12" rx="2" fill="#065F46" />
          <rect x="44" y="56" width="7" height="12" rx="2" fill="#065F46" />
        </g>
      );

    case "bronto":
      return (
        <g>
          <path d="M16 58 C24 44 42 42 46 48 L52 20 C53 15 62 14 64 20 C65 24 61 27 57 27 L54 54 C54 62 46 64 26 64 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.8" strokeLinejoin="round" />
          <circle cx="59" cy="20" r="2" fill="#0F172A" />
          <rect x="28" y="60" width="7" height="10" rx="2" fill="#0369A1" />
          <rect x="42" y="60" width="7" height="10" rx="2" fill="#0369A1" />
        </g>
      );

    case "fossil":
      return (
        <g>
          <circle cx="40" cy="40" r="26" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
          <path
            d="M40 40 C40 34 46 34 46 40 C46 48 34 50 32 40 C30 28 48 24 54 36 C58 48 44 58 30 54"
            fill="none"
            stroke="#92400E"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      );

    case "volcano":
      return (
        <g>
          <polygon points="12,66 32,26 48,26 68,66" fill="#78350F" stroke="#451A03" strokeWidth="3" strokeLinejoin="round" />
          <path d="M32 26 Q40 34 48 26 Q45 38 40 34 Q35 38 32 26 Z" fill="#F97316" />
          <circle cx="36" cy="17" r="5" fill="#FDE047" />
          <circle cx="45" cy="14" r="6" fill="#FB923C" />
          <circle cx="53" cy="19" r="3.5" fill="#FDE047" />
        </g>
      );

    case "footprint":
      return (
        <g>
          <ellipse cx="40" cy="48" rx="16" ry="14" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <ellipse cx="25" cy="28" rx="6" ry="9" fill="#4ADE80" stroke="#15803D" strokeWidth="2.4" transform="rotate(-20 25 28)" />
          <ellipse cx="40" cy="22" rx="6" ry="10" fill="#4ADE80" stroke="#15803D" strokeWidth="2.4" />
          <ellipse cx="55" cy="28" rx="6" ry="9" fill="#4ADE80" stroke="#15803D" strokeWidth="2.4" transform="rotate(20 55 28)" />
        </g>
      );

    case "train":
      return (
        <g>
          <rect x="46" y="18" width="12" height="16" rx="3" fill="#334155" />
          <circle cx="52" cy="12" r="5" fill="#CBD5E1" />
          <rect x="14" y="24" width="22" height="32" rx="4" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2.8" />
          <rect x="36" y="34" width="30" height="22" rx="4" fill="#EF4444" stroke="#991B1B" strokeWidth="2.8" />
          <rect x="19" y="30" width="12" height="10" rx="2" fill="#BAE6FD" />
          <circle cx="24" cy="59" r="7" fill="#1E293B" />
          <circle cx="44" cy="59" r="6" fill="#1E293B" />
          <circle cx="59" cy="59" r="6" fill="#1E293B" />
        </g>
      );

    case "tractor":
      return (
        <g>
          <rect x="18" y="22" width="22" height="24" rx="4" fill="#22C55E" stroke="#15803D" strokeWidth="2.8" />
          <rect x="22" y="26" width="14" height="12" rx="2" fill="#BAE6FD" />
          <rect x="40" y="34" width="24" height="18" rx="4" fill="#16A34A" stroke="#15803D" strokeWidth="2.8" />
          <rect x="54" y="22" width="5" height="12" rx="2" fill="#334155" />
          <circle cx="27" cy="55" r="12" fill="#1E293B" />
          <circle cx="27" cy="55" r="5" fill="#FACC15" />
          <circle cx="57" cy="58" r="8" fill="#1E293B" />
          <circle cx="57" cy="58" r="3" fill="#FACC15" />
        </g>
      );

    case "bee":
      return (
        <g>
          <ellipse cx="34" cy="24" rx="9" ry="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.2" transform="rotate(-20 34 24)" />
          <ellipse cx="48" cy="24" rx="9" ry="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.2" transform="rotate(20 48 24)" />
          <ellipse cx="40" cy="46" rx="22" ry="16" fill="#FACC15" stroke="#854D0E" strokeWidth="3" />
          <rect x="31" y="31" width="6" height="30" fill="#1E293B" />
          <rect x="43" y="31" width="6" height="30" fill="#1E293B" />
          <circle cx="24" cy="44" r="2.5" fill="#1E293B" />
        </g>
      );

    case "hedgehog":
      return (
        <g>
          <path d="M14 54 C14 30 32 22 48 28 L64 46 C66 52 62 58 54 58 L20 58 Z" fill="#92400E" stroke="#451A03" strokeWidth="2.8" />
          <path d="M44 36 C54 36 64 44 64 52 C60 56 50 58 44 56 Z" fill="#FDE68A" stroke="#78350F" strokeWidth="2.2" />
          <circle cx="54" cy="46" r="2.2" fill="#0F172A" />
          <circle cx="64" cy="50" r="2.8" fill="#0F172A" />
        </g>
      );

    case "owl":
      return (
        <g>
          <ellipse cx="40" cy="44" rx="22" ry="24" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <ellipse cx="40" cy="52" rx="14" ry="13" fill="#FEF3C7" />
          <circle cx="31" cy="36" r="8" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.4" />
          <circle cx="49" cy="36" r="8" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.4" />
          <circle cx="31" cy="36" r="3.5" fill="#0F172A" />
          <circle cx="49" cy="36" r="3.5" fill="#0F172A" />
          <polygon points="36,42 44,42 40,49" fill="#F59E0B" />
        </g>
      );

    case "cat":
      return (
        <g>
          <polygon points="20,34 18,14 34,24" fill="#FB923C" stroke="#9A3412" strokeWidth="2.6" />
          <polygon points="60,34 62,14 46,24" fill="#FB923C" stroke="#9A3412" strokeWidth="2.6" />
          <circle cx="40" cy="44" r="22" fill="#FDBA74" stroke="#9A3412" strokeWidth="3" />
          <circle cx="32" cy="41" r="3" fill="#0F172A" />
          <circle cx="48" cy="41" r="3" fill="#0F172A" />
          <polygon points="37,47 43,47 40,51" fill="#F43F5E" />
          <path d="M34 54 Q40 58 46 54" stroke="#9A3412" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );

    case "dog":
      return (
        <g>
          <ellipse cx="18" cy="42" rx="8" ry="15" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          <ellipse cx="62" cy="42" rx="8" ry="15" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          <circle cx="40" cy="44" r="21" fill="#D97706" stroke="#78350F" strokeWidth="3" />
          <circle cx="32" cy="40" r="3" fill="#0F172A" />
          <circle cx="48" cy="40" r="3" fill="#0F172A" />
          <ellipse cx="40" cy="48" rx="5" ry="3.5" fill="#0F172A" />
        </g>
      );

    case "fish":
      return (
        <g>
          <polygon points="56,40 70,26 70,54" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.6" strokeLinejoin="round" />
          <ellipse cx="38" cy="40" rx="22" ry="15" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2.8" />
          <circle cx="26" cy="37" r="3" fill="#FFFFFF" />
          <circle cx="25" cy="37" r="1.6" fill="#0F172A" />
          <path d="M38 30 Q43 40 38 50" stroke="#BAE6FD" strokeWidth="2.5" fill="none" />
        </g>
      );

    case "shop":
      return (
        <g>
          <rect x="14" y="34" width="52" height="32" rx="4" fill="#FEF3C7" stroke="#92400E" strokeWidth="2.8" />
          <path d="M10 34 L16 18 H64 L70 34 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.6" strokeLinejoin="round" />
          <rect x="22" y="42" width="16" height="14" rx="2" fill="#BAE6FD" stroke="#0369A1" strokeWidth="2" />
          <rect x="44" y="42" width="14" height="24" rx="2" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
        </g>
      );

    case "cup":
    case "mug":
      return (
        <g>
          <path d="M54 32 C64 32 64 50 54 50" fill="none" stroke="#0369A1" strokeWidth="5" strokeLinecap="round" />
          <rect x="18" y="24" width="38" height="38" rx="8" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          <circle cx="37" cy="43" r="6" fill="#FDE047" />
        </g>
      );

    case "hat":
      return (
        <g>
          <path d="M22 48 C22 24 58 24 58 48 Z" fill="#6366F1" stroke="#312E81" strokeWidth="3" />
          <rect x="12" y="46" width="56" height="10" rx="5" fill="#4F46E5" stroke="#312E81" strokeWidth="2.8" />
          <circle cx="40" cy="22" r="5" fill="#FACC15" />
        </g>
      );

    case "tree":
      return (
        <g>
          <rect x="34" y="48" width="12" height="20" rx="3" fill="#92400E" stroke="#451A03" strokeWidth="2.5" />
          <circle cx="40" cy="30" r="18" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="27" cy="39" r="12" fill="#4ADE80" stroke="#15803D" strokeWidth="2.6" />
          <circle cx="53" cy="39" r="12" fill="#4ADE80" stroke="#15803D" strokeWidth="2.6" />
        </g>
      );

    case "bell":
      return (
        <g>
          <circle cx="40" cy="60" r="6" fill="#B45309" />
          <path d="M40 16 C27 16 22 28 22 44 L16 56 H64 L58 44 C58 28 53 16 40 16 Z" fill="#FACC15" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
        </g>
      );

    case "shell":
      return (
        <g>
          <path d="M14 50 C14 26 26 18 40 18 C54 18 66 26 66 50 L50 62 H30 Z" fill="#FBCFE8" stroke="#BE185D" strokeWidth="3" strokeLinejoin="round" />
          <line x1="40" y1="20" x2="40" y2="60" stroke="#DB2777" strokeWidth="2.2" />
          <line x1="27" y1="24" x2="34" y2="60" stroke="#DB2777" strokeWidth="2.2" />
          <line x1="53" y1="24" x2="46" y2="60" stroke="#DB2777" strokeWidth="2.2" />
        </g>
      );

    case "boat":
      return (
        <g>
          <polygon points="40,14 40,46 60,46" fill="#FFFFFF" stroke="#0369A1" strokeWidth="2.6" strokeLinejoin="round" />
          <polygon points="36,20 36,46 20,46" fill="#FDE047" stroke="#B45309" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M14 48 H66 L58 62 H22 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2.8" strokeLinejoin="round" />
        </g>
      );

    default:
      return null;
  }
}
