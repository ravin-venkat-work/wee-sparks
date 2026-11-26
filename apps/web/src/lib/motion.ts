import type { Transition, Variants } from "motion/react";

/**
 * Shared duration tokens (in seconds) for UI motion across Wee Sparks.
 */
export const MOTION_DURATION = {
  instant: 0.12,
  fast: 0.2,
  base: 0.28,
  slow: 0.42,
} as const;

/**
 * Shared cubic-bezier easing curves for non-spring transitions (e.g. exits).
 */
export const MOTION_EASE = {
  smooth: [0.22, 1, 0.36, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
};

/**
 * Shared spring physics tuned for ages 4–6: responsive and tactile without
 * disorienting overshoot.
 */
export const MOTION_SPRING = {
  card: {
    type: "spring",
    stiffness: 320,
    damping: 28,
    mass: 0.9,
  },
  gentle: {
    type: "spring",
    stiffness: 240,
    damping: 26,
    mass: 1,
  },
  snappy: {
    type: "spring",
    stiffness: 420,
    damping: 30,
    mass: 0.75,
  },
} as const satisfies Record<string, Transition>;

/**
 * Exercise card slide-in / slide-out transition for KidSessionPlayer.
 */
export const EXERCISE_CARD_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    x: 56,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: MOTION_SPRING.card,
  },
  exit: {
    opacity: 0,
    x: -56,
    scale: 0.97,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASE.exit,
    },
  },
};

/**
 * Screen-level transition (Welcome <-> Playing <-> Celebrating).
 */
export const SCREEN_TRANSITION_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: MOTION_SPRING.gentle,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: MOTION_DURATION.fast,
      ease: MOTION_EASE.exit,
    },
  },
};
