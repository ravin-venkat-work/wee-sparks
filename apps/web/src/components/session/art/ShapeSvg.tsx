"use client";

interface ShapeSvgProps {
  shape: string;
  className?: string;
}

/**
 * Crisp, colourful custom inline SVG artwork for Foundation Stage 2D & 3D shapes
 * (circle, square, triangle, rectangle, cube, sphere, cylinder, cone).
 */
export function ShapeSvg({
  shape,
  className = "h-16 w-16",
}: ShapeSvgProps) {
  const s = shape.trim().toLowerCase();

  return (
    <svg viewBox="0 0 80 80" className={className} role="img" aria-hidden="true">
      {s.includes("circle") || s.includes("sphere") ? (
        <g>
          <circle
            cx="40"
            cy="40"
            r="28"
            fill="#38BDF8"
            stroke="#0369A1"
            strokeWidth="4"
          />
          <path
            d="M25 27 Q33 18 45 20"
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="33" cy="39" r="2.6" fill="#0C4A6E" />
          <circle cx="47" cy="39" r="2.6" fill="#0C4A6E" />
          <path
            d="M34 47 Q40 52 46 47"
            fill="none"
            stroke="#0C4A6E"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      ) : s.includes("triangle") || s.includes("cone") ? (
        <g>
          <polygon
            points="40,11 69,66 11,66"
            fill="#4ADE80"
            stroke="#15803D"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="14" r="3.5" fill="#BBF7D0" />
          <circle cx="65" cy="63" r="3.5" fill="#BBF7D0" />
          <circle cx="15" cy="63" r="3.5" fill="#BBF7D0" />
          <circle cx="34" cy="45" r="2.5" fill="#14532D" />
          <circle cx="46" cy="45" r="2.5" fill="#14532D" />
          <path
            d="M35 53 Q40 57 45 53"
            fill="none"
            stroke="#14532D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      ) : s.includes("square") || s.includes("cube") ? (
        <g>
          <rect
            x="14"
            y="14"
            width="52"
            height="52"
            rx="6"
            fill="#FACC15"
            stroke="#B45309"
            strokeWidth="4"
          />
          <line
            x1="22"
            y1="22"
            x2="38"
            y2="22"
            stroke="#FEF9C3"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="33" cy="39" r="2.6" fill="#78350F" />
          <circle cx="47" cy="39" r="2.6" fill="#78350F" />
          <path
            d="M34 48 Q40 53 46 48"
            fill="none"
            stroke="#78350F"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      ) : s.includes("rectangle") || s.includes("cylinder") ? (
        <g>
          <rect
            x="7"
            y="22"
            width="66"
            height="36"
            rx="6"
            fill="#F472B6"
            stroke="#BE185D"
            strokeWidth="4"
          />
          <line
            x1="15"
            y1="29"
            x2="38"
            y2="29"
            stroke="#FCE7F3"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <circle cx="33" cy="40" r="2.6" fill="#831843" />
          <circle cx="47" cy="40" r="2.6" fill="#831843" />
          <path
            d="M34 47 Q40 51 46 47"
            fill="none"
            stroke="#831843"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <circle
          cx="40"
          cy="40"
          r="26"
          fill="#C4B5FD"
          stroke="#6D28D9"
          strokeWidth="4"
        />
      )}
    </svg>
  );
}
