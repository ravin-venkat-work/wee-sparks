"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
import { useCalmMode } from "../providers/MotionProvider";
import { SparkySvg, type MascotMood } from "./SparkySvg";

interface CompanionAvatarSvgProps {
  avatarId: CompanionAvatarId;
  mood?: MascotMood;
  animated?: boolean;
  className?: string;
}

function SharedEyes({
  mood,
  isBlinking,
  y = 54,
  leftX = 36,
  rightX = 60,
}: {
  mood: MascotMood;
  isBlinking: boolean;
  y?: number;
  leftX?: number;
  rightX?: number;
}) {
  if (mood === "celebrating") {
    return (
      <g stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d={`M${leftX - 5} ${y} Q${leftX} ${y - 7} ${leftX + 5} ${y}`} />
        <path d={`M${rightX - 5} ${y} Q${rightX} ${y - 7} ${rightX + 5} ${y}`} />
      </g>
    );
  }

  return (
    <motion.g
      animate={{ scaleY: isBlinking ? 0.12 : 1 }}
      transition={{ duration: 0.11, ease: MOTION_EASE.smooth }}
      style={{ transformOrigin: `48px ${y}px` }}
    >
      <circle cx={leftX} cy={y} r="4.8" fill="#1E293B" />
      <circle
        cx={mood === "thinking" ? leftX + 1.8 : leftX - 1.5}
        cy={y - 2}
        r="1.8"
        fill="#FFFFFF"
      />
      <circle cx={rightX} cy={y} r="4.8" fill="#1E293B" />
      <circle
        cx={mood === "thinking" ? rightX + 1.8 : rightX - 1.5}
        cy={y - 2}
        r="1.8"
        fill="#FFFFFF"
      />
    </motion.g>
  );
}

/**
 * Modular animated inline SVG renderer for all 6 Wee Sparks companions:
 * sparky (fox), pip (Rathlin puffin), rex (friendly dino), nova (space bot),
 * pippa (panda cub), and rusty (Belfast bus).
 *
 * Drives smooth idle blink, gentle float, feature twitch, thinking head-tilt,
 * encouraging double-nod, and celebrating jump — respecting prefers-reduced-motion.
 */
export function CompanionAvatarSvg({
  avatarId,
  mood = "idle",
  animated = true,
  className = "h-full w-full",
}: CompanionAvatarSvgProps) {
  const osReducedMotion = Boolean(useReducedMotion());
  const calmMode = useCalmMode();
  const prefersReducedMotion = osReducedMotion || calmMode;
  const motionActive = animated && !prefersReducedMotion;
  const [isBlinking, setIsBlinking] = useState(false);
  const [accentTwitch, setAccentTwitch] = useState(false);

  useEffect(() => {
    if (!motionActive || mood === "celebrating" || avatarId === "sparky") {
      setIsBlinking(false);
      return;
    }
    let closeTimer: number | null = null;
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      closeTimer = window.setTimeout(() => setIsBlinking(false), 140);
    }, 3500);
    return () => {
      window.clearInterval(interval);
      if (closeTimer !== null) window.clearTimeout(closeTimer);
    };
  }, [motionActive, mood, avatarId]);

  useEffect(() => {
    if (!motionActive || mood !== "idle" || avatarId === "sparky") {
      setAccentTwitch(false);
      return;
    }
    let resetTimer: number | null = null;
    const interval = window.setInterval(() => {
      setAccentTwitch(true);
      resetTimer = window.setTimeout(() => setAccentTwitch(false), 260);
    }, 4600);
    return () => {
      window.clearInterval(interval);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, [motionActive, mood, avatarId]);

  if (avatarId === "sparky") {
    return (
      <SparkySvg mood={mood} animated={animated} className={className} />
    );
  }

  const headAnimate: TargetAndTransition = !motionActive
    ? { y: 0, rotate: mood === "thinking" ? -8 : 0, scaleY: 1 }
    : mood === "celebrating"
    ? {
        y: [0, -8, 0, -5, 0],
        rotate: [0, -4, 0, 4, 0],
        scaleY: [1, 1.04, 0.96, 1.03, 1],
        transition: { duration: 0.92, repeat: Infinity, ease: "easeInOut" },
      }
    : mood === "encouraging"
    ? {
        y: [0, 3.5, 0, 2.5, 0],
        rotate: [0, 2.5, -0.5, 2, 0],
        scaleY: 1,
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.7,
          ease: "easeInOut",
        },
      }
    : mood === "thinking"
    ? { y: -1, rotate: -9, scaleY: 1, transition: MOTION_SPRING.gentle }
    : {
        y: [0, -2.5, 0],
        rotate: 0,
        scaleY: 1,
        transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
      };

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* Shared mood overlays */}
      {mood === "celebrating" && (
        <motion.g
          animate={
            motionActive
              ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1.08, 0.92] }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "48px 20px" }}
        >
          <path
            d="M14 18 L17 11 L20 18 L27 21 L20 24 L17 31 L14 24 L7 21 Z"
            fill="#F59E0B"
          />
          <path
            d="M78 14 L80 9 L82 14 L87 16 L82 18 L80 23 L78 18 L73 16 Z"
            fill="#10B981"
          />
          <circle cx="84" cy="36" r="3.5" fill="#FBBF24" />
        </motion.g>
      )}
      {mood === "thinking" && (
        <motion.g
          animate={motionActive ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="78" cy="18" r="5" fill="#8B5CF6" opacity="0.85" />
          <circle cx="85" cy="10" r="3" fill="#A78BFA" />
        </motion.g>
      )}
      {mood === "encouraging" && (
        <motion.path
          d="M79 22 C79 18 74 16 72 20 C70 16 65 18 65 22 C65 26 72 30 72 30 C72 30 79 26 79 22 Z"
          fill="#F43F5E"
          animate={
            motionActive
              ? { y: [0, -3.5, 0], scale: [1, 1.12, 1] }
              : { y: 0, scale: 1 }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "72px 23px" }}
        />
      )}

      <motion.g
        animate={headAnimate}
        style={{ transformOrigin: "48px 56px" }}
      >
        {avatarId === "pip" && (
          /* Pip the Rathlin Puffin */
          <g>
            {/* Flapping wings */}
            <motion.ellipse
              cx="19"
              cy="61"
              rx="8"
              ry="14"
              fill="#1E293B"
              animate={{
                rotate:
                  mood === "celebrating" && motionActive
                    ? [-26, 8, -26]
                    : accentTwitch
                    ? -14
                    : 10,
              }}
              transition={
                mood === "celebrating" && motionActive
                  ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
                  : MOTION_SPRING.snappy
              }
              style={{ transformOrigin: "23px 54px" }}
            />
            <motion.ellipse
              cx="77"
              cy="61"
              rx="8"
              ry="14"
              fill="#1E293B"
              animate={{
                rotate:
                  mood === "celebrating" && motionActive
                    ? [26, -8, 26]
                    : accentTwitch
                    ? 14
                    : -10,
              }}
              transition={
                mood === "celebrating" && motionActive
                  ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
                  : MOTION_SPRING.snappy
              }
              style={{ transformOrigin: "73px 54px" }}
            />
            {/* Head & Body */}
            <ellipse
              cx="48"
              cy="54"
              rx="29"
              ry="29"
              fill="#1E293B"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            <ellipse cx="48" cy="59" rx="22" ry="21" fill="#F8FAFC" />
            <SharedEyes mood={mood} isBlinking={isBlinking} y={50} />
            <ellipse cx="29" cy="59" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="67" cy="59" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.8" />
            {/* Iconic colourful NI Puffin beak */}
            <path
              d="M40 58 Q48 54 56 58 L52 70 Q48 73 44 70 Z"
              fill="#F97316"
              stroke="#9A3412"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M43 58 L53 58 L51.5 64 L44.5 64 Z" fill="#FACC15" />
          </g>
        )}

        {avatarId === "rex" && (
          /* Rex the Friendly Dino */
          <g>
            {/* Playful back spikes */}
            <motion.g
              animate={{ rotate: accentTwitch ? -6 : 0 }}
              transition={MOTION_SPRING.snappy}
              style={{ transformOrigin: "48px 34px" }}
            >
              <polygon points="34,26 40,14 46,26" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="48,24 56,13 62,26" fill="#F59E0B" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
            </motion.g>
            <ellipse
              cx="48"
              cy="55"
              rx="30"
              ry="27"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="2.5"
            />
            <ellipse cx="48" cy="67" rx="20" ry="13" fill="#BBF7D0" />
            <circle cx="28" cy="44" r="4" fill="#16A34A" />
            <circle cx="68" cy="43" r="3.5" fill="#16A34A" />
            <SharedEyes mood={mood} isBlinking={isBlinking} y={51} />
            <ellipse cx="28" cy="60" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.75" />
            <ellipse cx="68" cy="60" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.75" />
            {mood === "celebrating" ? (
              <path d="M38 64 Q48 76 58 64 Z" fill="#F43F5E" stroke="#14532D" strokeWidth="2.2" />
            ) : (
              <path d="M39 65 Q48 72 57 65" stroke="#14532D" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
          </g>
        )}

        {avatarId === "nova" && (
          /* Nova the Space Astro-Bot */
          <g>
            {/* Wiggling Star Antenna */}
            <motion.g
              animate={{
                rotate:
                  mood === "celebrating" && motionActive
                    ? [-12, 12, -12]
                    : accentTwitch
                    ? 14
                    : 0,
              }}
              transition={
                mood === "celebrating" && motionActive
                  ? { duration: 0.45, repeat: Infinity, ease: "easeInOut" }
                  : MOTION_SPRING.snappy
              }
              style={{ transformOrigin: "48px 30px" }}
            >
              <line x1="48" y1="30" x2="48" y2="16" stroke="#0369A1" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="48" cy="14" r="5.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
            </motion.g>
            {/* Side ear pods */}
            <rect x="13" y="45" width="9" height="20" rx="4.5" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.2" />
            <rect x="74" y="45" width="9" height="20" rx="4.5" fill="#38BDF8" stroke="#0369A1" strokeWidth="2.2" />
            {/* Helmet head */}
            <rect
              x="20"
              y="29"
              width="56"
              height="50"
              rx="20"
              fill="#E0F2FE"
              stroke="#0369A1"
              strokeWidth="2.8"
            />
            {/* Visor face */}
            <rect x="26" y="38" width="44" height="33" rx="13" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="2" />
            <SharedEyes mood={mood} isBlinking={isBlinking} y={52} leftX={38} rightX={58} />
            <ellipse cx="31" cy="60" rx="3.8" ry="2.4" fill="#FDA4AF" opacity="0.75" />
            <ellipse cx="65" cy="60" rx="3.8" ry="2.4" fill="#FDA4AF" opacity="0.75" />
            {mood === "celebrating" ? (
              <path d="M40 62 Q48 70 56 62 Z" fill="#F43F5E" stroke="#0C4A6E" strokeWidth="2" />
            ) : (
              <path d="M41 63 Q48 68 55 63" stroke="#0C4A6E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            )}
          </g>
        )}

        {avatarId === "pippa" && (
          /* Pippa the Panda Cub */
          <g>
            {/* Round Panda Ears */}
            <motion.circle
              cx="26"
              cy="31"
              r="11"
              fill="#1E293B"
              animate={{ scale: accentTwitch ? 1.1 : 1 }}
              transition={MOTION_SPRING.snappy}
              style={{ transformOrigin: "26px 31px" }}
            />
            <motion.circle
              cx="70"
              cy="31"
              r="11"
              fill="#1E293B"
              animate={{ scale: accentTwitch ? 1.1 : 1 }}
              transition={MOTION_SPRING.snappy}
              style={{ transformOrigin: "70px 31px" }}
            />
            <ellipse
              cx="48"
              cy="55"
              rx="30"
              ry="27"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="2.6"
            />
            {/* Eye patches */}
            <ellipse cx="35" cy="53" rx="9" ry="7.5" fill="#334155" transform="rotate(-12 35 53)" />
            <ellipse cx="61" cy="53" rx="9" ry="7.5" fill="#334155" transform="rotate(12 61 53)" />
            {mood === "celebrating" ? (
              <g stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" fill="none">
                <path d="M31 54 Q35 48 39 54" />
                <path d="M57 54 Q61 48 65 54" />
              </g>
            ) : (
              <motion.g
                animate={{ scaleY: isBlinking ? 0.12 : 1 }}
                transition={{ duration: 0.11, ease: MOTION_EASE.smooth }}
                style={{ transformOrigin: "48px 53px" }}
              >
                <circle cx="35.5" cy="53" r="3.4" fill="#FFFFFF" />
                <circle cx="35.5" cy="53" r="1.8" fill="#0F172A" />
                <circle cx="60.5" cy="53" r="3.4" fill="#FFFFFF" />
                <circle cx="60.5" cy="53" r="1.8" fill="#0F172A" />
              </motion.g>
            )}
            <ellipse cx="26" cy="63" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="70" cy="63" rx="4.2" ry="2.6" fill="#FDA4AF" opacity="0.8" />
            <ellipse cx="48" cy="61" rx="4.5" ry="3.2" fill="#1E293B" />
            {mood === "celebrating" ? (
              <path d="M40 67 Q48 76 56 67 Z" fill="#F43F5E" stroke="#1E293B" strokeWidth="2" />
            ) : (
              <path d="M42 68 Q48 73 54 68" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>
        )}

        {avatarId === "rusty" && (
          /* Rusty the Friendly Belfast Bus */
          <g>
            {/* Side wing mirrors */}
            <motion.rect
              x="12"
              y="44"
              width="7"
              height="14"
              rx="3"
              fill="#F43F5E"
              stroke="#9F1239"
              strokeWidth="2"
              animate={{ rotate: accentTwitch ? -10 : 0 }}
              transition={MOTION_SPRING.snappy}
              style={{ transformOrigin: "19px 51px" }}
            />
            <motion.rect
              x="77"
              y="44"
              width="7"
              height="14"
              rx="3"
              fill="#F43F5E"
              stroke="#9F1239"
              strokeWidth="2"
              animate={{ rotate: accentTwitch ? 10 : 0 }}
              transition={MOTION_SPRING.snappy}
              style={{ transformOrigin: "77px 51px" }}
            />
            {/* Bus body */}
            <rect
              x="19"
              y="26"
              width="58"
              height="52"
              rx="14"
              fill="#F43F5E"
              stroke="#9F1239"
              strokeWidth="2.6"
            />
            {/* Destination board */}
            <rect x="31" y="31" width="34" height="7" rx="3.5" fill="#FDE047" />
            {/* Windscreen with eyes */}
            <rect x="25" y="42" width="46" height="22" rx="8" fill="#E0F2FE" stroke="#9F1239" strokeWidth="2" />
            <SharedEyes mood={mood} isBlinking={isBlinking} y={53} leftX={38} rightX={58} />
            {/* Headlights & smile bumper */}
            <circle cx="29" cy="70" r="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="67" cy="70" r="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
            {mood === "celebrating" ? (
              <path d="M40 68 Q48 76 56 68 Z" fill="#FFFFFF" stroke="#881337" strokeWidth="2" />
            ) : (
              <path d="M41 70 Q48 75 55 70" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            )}
            {/* Wheels */}
            <rect x="25" y="77" width="12" height="7" rx="3" fill="#1E293B" />
            <rect x="59" y="77" width="12" height="7" rx="3" fill="#1E293B" />
          </g>
        )}
      </motion.g>
    </svg>
  );
}
