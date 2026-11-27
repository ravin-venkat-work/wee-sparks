"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CompanionAvatarId } from "@wee-sparks/curriculum-schema";
import { MOTION_DURATION, MOTION_SPRING } from "@/lib/motion";
import {
  generateBurstParticles,
  REWARD_BURST_MAX_DURATION_S,
  resolveRewardVisualMode,
  type BurstParticle,
  type RewardBurstVariant,
} from "@/lib/rewardBurst";
import { SparkyMascot } from "./SparkyMascot";

interface RewardBurstProps {
  /** Whether the current step has just been answered correctly. */
  active: boolean;
  /** Unique key per solved step so the burst replays cleanly on each solve. */
  burstKey: string;
  /** Use "finale" on the final step of the quest for a bigger celebration with Sparky. */
  variant?: RewardBurstVariant;
  /** Chosen learner companion avatar to celebrate with on finale steps. */
  avatarId?: CompanionAvatarId;
}

function ParticleGlyph({ particle }: { particle: BurstParticle }) {
  if (particle.shape === "star") {
    return (
      <svg
        width={particle.sizePx}
        height={particle.sizePx}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M12 2 L14.9 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.1 8.6 Z"
          fill={particle.color}
        />
      </svg>
    );
  }

  if (particle.shape === "sparkle") {
    return (
      <svg
        width={particle.sizePx}
        height={particle.sizePx}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M12 1 L14.4 9.6 L23 12 L14.4 14.4 L12 23 L9.6 14.4 L1 12 L9.6 9.6 Z"
          fill={particle.color}
        />
      </svg>
    );
  }

  return (
    <svg
      width={Math.round(particle.sizePx * 0.65)}
      height={Math.round(particle.sizePx * 0.65)}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" fill={particle.color} />
    </svg>
  );
}

/**
 * Offline inline-SVG sparkle/star particle burst (< 1.2s, zero network).
 * - Standard steps: snappy radial star/sparkle burst over the solved stage.
 * - Final step ("finale"): larger multi-ring burst with a celebratory Sparky centerpiece.
 * - Prefers-reduced-motion: switches to a calm, accessible glow without flying particles.
 */
export function RewardBurst({
  active,
  burstKey,
  variant = "standard",
  avatarId = "sparky",
}: RewardBurstProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [burstVisible, setBurstVisible] = useState(false);

  const isFinalStep = variant === "finale";
  const visualMode = resolveRewardVisualMode({
    active,
    isFinalStep,
    prefersReducedMotion,
  });

  const particles = useMemo(
    () => generateBurstParticles(variant),
    [variant]
  );

  useEffect(() => {
    if (!active) {
      setBurstVisible(false);
      return;
    }

    setBurstVisible(true);
    const hideAfterMs = Math.round(REWARD_BURST_MAX_DURATION_S * 1000);
    const timer = window.setTimeout(() => {
      setBurstVisible(false);
    }, hideAfterMs);

    return () => window.clearTimeout(timer);
  }, [active, burstKey]);

  if (visualMode === "none") {
    return null;
  }

  // Reduced-motion path: calm glow border (plus gentle static Sparky badge on finale)
  if (visualMode === "glow" || visualMode === "glow-finale") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
      >
        <div
          className={`h-full w-full rounded-3xl ring-4 transition-opacity duration-300 ${
            visualMode === "glow-finale"
              ? "bg-amber-200/15 ring-amber-400 shadow-[inset_0_0_40px_rgba(245,158,11,0.35)]"
              : "bg-emerald-200/10 ring-emerald-400 shadow-[inset_0_0_32px_rgba(16,185,129,0.3)]"
          }`}
        />
        {visualMode === "glow-finale" && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-3xl bg-white/95 p-2 shadow-[0_0_24px_rgba(245,158,11,0.45)] ring-4 ring-amber-300">
            <SparkyMascot avatarId={avatarId} mood="celebrating" size="md" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-3xl"
    >
      <AnimatePresence>
        {burstVisible && (
          <motion.div
            key={burstKey}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: MOTION_DURATION.instant } }}
            className="relative flex h-full w-full items-center justify-center"
          >
            {/* Expanding halo ring */}
            <motion.div
              initial={{ scale: 0.35, opacity: 0.85 }}
              animate={{
                scale: isFinalStep ? 2.15 : 1.55,
                opacity: 0,
              }}
              transition={{
                duration: isFinalStep ? 0.95 : 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`absolute rounded-full border-4 ${
                isFinalStep
                  ? "h-44 w-44 border-amber-400/80"
                  : "h-32 w-32 border-emerald-400/75"
              }`}
            />

            {/* Radial inline SVG sparkle & star particles (all finish < 1.2s) */}
            {particles.map((particle) => {
              const rad = (particle.angleDeg * Math.PI) / 180;
              const x = Math.round(Math.cos(rad) * particle.distancePx);
              const y = Math.round(Math.sin(rad) * particle.distancePx);

              return (
                <motion.div
                  key={particle.id}
                  initial={{ x: 0, y: 0, scale: 0.25, opacity: 0, rotate: 0 }}
                  animate={{
                    x,
                    y,
                    scale: [0.25, 1.18, 0.7],
                    opacity: [0, 1, 1, 0],
                    rotate: particle.rotateDeg,
                  }}
                  transition={{
                    duration: particle.durationS,
                    delay: particle.delayS,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute"
                >
                  <ParticleGlyph particle={particle} />
                </motion.div>
              );
            })}

            {/* Bigger final-step celebration with Sparky */}
            {isFinalStep && (
              <motion.div
                initial={{ scale: 0.45, y: 28, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 18,
                  mass: 0.85,
                }}
                className="relative flex flex-col items-center rounded-3xl bg-white/95 p-3 shadow-2xl ring-4 ring-amber-300"
              >
                <SparkyMascot avatarId={avatarId} mood="celebrating" size="md" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RewardPopCardProps {
  /** Triggers the quick spring pop (or calm glow under prefers-reduced-motion). */
  isPopped: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wrapper that gives a chosen correct answer card a quick spring pop,
 * automatically switching to a simple emerald glow under prefers-reduced-motion.
 */
export function RewardPopCard({
  isPopped,
  className = "",
  children,
}: RewardPopCardProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [popPhase, setPopPhase] = useState<"idle" | "peak" | "settled">("idle");

  useEffect(() => {
    if (!isPopped) {
      setPopPhase("idle");
      return;
    }
    setPopPhase("peak");
    const timer = window.setTimeout(() => {
      setPopPhase("settled");
    }, 170);
    return () => window.clearTimeout(timer);
  }, [isPopped]);

  if (prefersReducedMotion) {
    return (
      <div
        className={`rounded-3xl transition-shadow duration-200 ${
          isPopped
            ? "shadow-[0_0_24px_rgba(16,185,129,0.55)] ring-4 ring-emerald-300"
            : ""
        } ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      animate={
        popPhase === "peak"
          ? { scale: 1.08, y: -5 }
          : { scale: 1, y: 0 }
      }
      transition={
        popPhase === "peak" ? MOTION_SPRING.snappy : MOTION_SPRING.card
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
