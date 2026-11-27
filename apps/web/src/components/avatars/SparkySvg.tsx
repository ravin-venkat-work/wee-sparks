"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
import { useCalmMode } from "../providers/MotionProvider";

export type MascotMood = "idle" | "thinking" | "encouraging" | "celebrating";

export interface SparkySvgProps {
  mood: MascotMood;
  /** Enables autonomous blink, ear twitch, nod, and jump loops (respects prefers-reduced-motion). */
  animated?: boolean;
  className?: string;
}

/**
 * Reusable animated inline SVG for Sparky the fox-spark mascot.
 * Smoothly animates between four moods (idle, thinking, encouraging, celebrating)
 * with periodic idle blinking, ear twitches, thinking head tilt, encouraging nods,
 * and celebrating jumps — zero extra bundle weight, 100% offline-first, and
 * automatically calm under prefers-reduced-motion.
 */
export function SparkySvg({
  mood,
  animated = true,
  className = "h-full w-full",
}: SparkySvgProps) {
  const osReducedMotion = Boolean(useReducedMotion());
  const calmMode = useCalmMode();
  const prefersReducedMotion = osReducedMotion || calmMode;
  const motionActive = animated && !prefersReducedMotion;

  const [isBlinking, setIsBlinking] = useState(false);
  const [earTwitchSide, setEarTwitchSide] = useState<"none" | "left" | "right">(
    "none"
  );

  // Periodic natural eye blink every ~3.4s (when eyes are open)
  useEffect(() => {
    if (!motionActive || mood === "celebrating") {
      setIsBlinking(false);
      return;
    }

    let closeTimer: number | null = null;
    const interval = window.setInterval(() => {
      setIsBlinking(true);
      closeTimer = window.setTimeout(() => {
        setIsBlinking(false);
      }, 140);
    }, 3400);

    return () => {
      window.clearInterval(interval);
      if (closeTimer !== null) window.clearTimeout(closeTimer);
    };
  }, [motionActive, mood]);

  // Periodic subtle ear twitch every ~4.5s during idle/thinking
  useEffect(() => {
    if (!motionActive || (mood !== "idle" && mood !== "thinking")) {
      setEarTwitchSide("none");
      return;
    }

    let toggle = false;
    let resetTimer: number | null = null;
    const interval = window.setInterval(() => {
      toggle = !toggle;
      setEarTwitchSide(toggle ? "right" : "left");
      resetTimer = window.setTimeout(() => {
        setEarTwitchSide("none");
      }, 240);
    }, 4500);

    return () => {
      window.clearInterval(interval);
      if (resetTimer !== null) window.clearTimeout(resetTimer);
    };
  }, [motionActive, mood]);

  // Whole-head / posture animation per mood
  const headAnimate: TargetAndTransition = !motionActive
    ? {
        y: 0,
        rotate: mood === "thinking" ? -8 : 0,
        scaleY: 1,
      }
    : mood === "celebrating"
    ? {
        y: [0, -8, 0, -5, 0],
        rotate: [0, -4, 0, 4, 0],
        scaleY: [1, 1.04, 0.96, 1.03, 1],
        transition: {
          duration: 0.92,
          repeat: Infinity,
          ease: "easeInOut",
        },
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
    ? {
        y: -1,
        rotate: -9,
        scaleY: 1,
        transition: MOTION_SPRING.gentle,
      }
    : {
        y: [0, -2.5, 0],
        rotate: 0,
        scaleY: 1,
        transition: {
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const leftEarRotate =
    mood === "celebrating"
      ? motionActive
        ? [-5, 5, -5]
        : 0
      : mood === "thinking"
      ? -3
      : mood === "encouraging"
      ? -4
      : earTwitchSide === "left"
      ? -11
      : 0;

  const rightEarRotate =
    mood === "celebrating"
      ? motionActive
        ? [5, -5, 5]
        : 0
      : mood === "thinking"
      ? earTwitchSide === "right"
        ? 15
        : 10
      : mood === "encouraging"
      ? 4
      : earTwitchSide === "right"
      ? 11
      : 0;

  const earTransition =
    mood === "celebrating" && motionActive
      ? { duration: 0.46, repeat: Infinity, ease: "easeInOut" as const }
      : MOTION_SPRING.snappy;

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* Celebration sparkles */}
      {mood === "celebrating" && (
        <motion.g
          animate={
            motionActive
              ? { opacity: [0.55, 1, 0.55], scale: [0.92, 1.08, 0.92] }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "48px 22px" }}
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

      {/* Thinking dots */}
      {mood === "thinking" && (
        <motion.g
          animate={motionActive ? { y: [0, -3, 0] } : { y: 0 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="78" cy="18" r="5" fill="#8B5CF6" opacity="0.85" />
          <circle cx="85" cy="10" r="3" fill="#A78BFA" />
        </motion.g>
      )}

      {/* Encouraging heart */}
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

      {/* Animated Head + Ears + Paws Group */}
      <motion.g
        animate={headAnimate}
        style={{ transformOrigin: "48px 58px" }}
      >
        {/* Left Fox Ear */}
        <motion.g
          animate={{ rotate: leftEarRotate }}
          transition={earTransition}
          style={{ transformOrigin: "28px 36px" }}
        >
          <path
            d="M22 44 L17 15 L41 30 Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M24 38 L22 22 L35 31 Z" fill="#FED7AA" />
        </motion.g>

        {/* Right Fox Ear */}
        <motion.g
          animate={{ rotate: rightEarRotate }}
          transition={earTransition}
          style={{ transformOrigin: "68px 36px" }}
        >
          <path
            d="M74 44 L79 15 L55 30 Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M72 38 L74 22 L61 31 Z" fill="#FED7AA" />
        </motion.g>

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

        {/* Eyes per mood (with smooth blink on non-celebrating moods) */}
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
        ) : (
          <motion.g
            animate={{ scaleY: isBlinking ? 0.12 : 1 }}
            transition={{ duration: 0.11, ease: MOTION_EASE.smooth }}
            style={{ transformOrigin: "48px 55px" }}
          >
            {mood === "thinking" ? (
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
          </motion.g>
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
          <motion.g
            animate={motionActive ? { y: [0, -4, 0] } : { y: 0 }}
            transition={{ duration: 0.46, repeat: Infinity, ease: "easeInOut" }}
          >
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
          </motion.g>
        )}
      </motion.g>
    </svg>
  );
}
