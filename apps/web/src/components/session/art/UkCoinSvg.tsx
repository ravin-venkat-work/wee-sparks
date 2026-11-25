"use client";

import type { UkCoin } from "@wee-sparks/curriculum-schema";

interface UkCoinSvgProps {
  coin: UkCoin;
  className?: string;
}

/**
 * Custom inline SVG artwork for Northern Ireland / UK coins (1p, 2p, 5p, 10p, 20p):
 * - 1p & 2p: warm copper bronze with embossed rim
 * - 5p & 10p: bright cupro-nickel silver round coins
 * - 20p: authentic 7-sided equilateral heptagon silver coin
 */
export function UkCoinSvg({
  coin,
  className = "h-16 w-16",
}: UkCoinSvgProps) {
  const isCopper = coin === "1p" || coin === "2p";
  const isHeptagon = coin === "20p";

  const fillOuter = isCopper ? "#B45309" : "#94A3B8";
  const fillInner = isCopper ? "#D97706" : "#E2E8F0";
  const strokeColour = isCopper ? "#78350F" : "#475569";
  const textColour = isCopper ? "#FEF3C7" : "#1E293B";
  const rimColour = isCopper ? "#F59E0B" : "#F8FAFC";

  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label={`UK ${coin} coin`}
    >
      {isHeptagon ? (
        <>
          {/* 7-sided UK 20p coin */}
          <polygon
            points="40,6 66,18 73,46 55,70 25,70 7,46 14,18"
            fill={fillOuter}
            stroke={strokeColour}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <polygon
            points="40,12 61,22 67,45 52,64 28,64 13,45 19,22"
            fill={fillInner}
            stroke={rimColour}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle
            cx="40"
            cy="40"
            r={coin === "2p" || coin === "10p" ? 34 : 30}
            fill={fillOuter}
            stroke={strokeColour}
            strokeWidth="3.2"
          />
          <circle
            cx="40"
            cy="40"
            r={coin === "2p" || coin === "10p" ? 28 : 24}
            fill={fillInner}
            stroke={rimColour}
            strokeWidth="2"
            strokeDasharray="3 2"
          />
        </>
      )}

      {/* Subtle metallic highlight */}
      <path
        d="M22 24 Q34 15 48 18"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Crisp denomination label */}
      <text
        x="40"
        y="47"
        textAnchor="middle"
        fontSize={coin.length >= 3 ? "21" : "24"}
        fontWeight="900"
        fill={textColour}
      >
        {coin}
      </text>
    </svg>
  );
}
