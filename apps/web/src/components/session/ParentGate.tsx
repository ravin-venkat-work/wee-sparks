"use client";

import { useEffect, useRef, useState } from "react";
import {
  evaluateHoldProgress,
  generateParentChallenge,
  PARENT_GATE_HOLD_MS,
  verifyParentChallengeAnswer,
  type ParentGateChallenge,
} from "@/lib/parentGate";

interface ParentGateTriggerProps {
  onUnlock: () => void;
  onRequestChallenge: () => void;
  label?: string;
}

/**
 * Discreet corner trigger for grown-ups (>= 64px x 64px):
 * - Hold for 3 seconds to unlock directly (with circular SVG progress ring).
 * - Quick tap (< 450ms) opens the spoken-free sum challenge modal.
 */
export function ParentGateTrigger({
  onUnlock,
  onRequestChallenge,
  label,
}: ParentGateTriggerProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const unlockedDuringHoldRef = useRef(false);

  const stopHoldTimer = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    holdStartRef.current = null;
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => () => stopHoldTimer(), []);

  const beginHold = () => {
    stopHoldTimer();
    unlockedDuringHoldRef.current = false;
    holdStartRef.current = Date.now();
    setIsHolding(true);

    const tick = () => {
      if (holdStartRef.current === null) return;
      const result = evaluateHoldProgress(
        holdStartRef.current,
        Date.now(),
        PARENT_GATE_HOLD_MS
      );
      setProgress(result.progress);

      if (result.unlocked) {
        unlockedDuringHoldRef.current = true;
        stopHoldTimer();
        onUnlock();
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (holdStartRef.current === null) return;
    const elapsed = Date.now() - holdStartRef.current;
    const alreadyUnlocked = unlockedDuringHoldRef.current;
    stopHoldTimer();

    // Quick tap opens the spoken-free sum fallback for desktop/keyboard users
    if (!alreadyUnlocked && elapsed < 450) {
      onRequestChallenge();
    }
  };

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        beginHold();
      }}
      onPointerUp={endHold}
      onPointerCancel={stopHoldTimer}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
          e.preventDefault();
          onRequestChallenge();
        }
      }}
      aria-label="Grown-ups: hold for 3 seconds or tap to answer a sum"
      title="Hold for 3 seconds (or tap for adult check)"
      className={`touch-card relative inline-flex items-center justify-center gap-2 rounded-2xl bg-white/90 text-slate-600 shadow-sm ring-2 ring-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500 ${
        label ? "px-4 py-3" : "h-16 w-16"
      }`}
    >
      {/* 3-second hold circular progress ring */}
      {isHolding && (
        <svg
          viewBox="0 0 64 64"
          className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#0284C7"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
      )}

      <span className="relative text-2xl" aria-hidden="true">
        🔒
      </span>
      {label && (
        <span className="relative text-sm font-extrabold text-slate-700">
          {label}
        </span>
      )}
    </button>
  );
}

interface ParentGateModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  onCancel: () => void;
}

/**
 * Spoken-free ParentGate challenge modal.
 * Deliberately invokes ZERO speech synthesis or audio reading so pre-readers
 * cannot hear the sum or answer. Offers both a simple adult sum (e.g. 12 + 7)
 * and a 3-second hold alternative.
 */
export function ParentGateModal({
  isOpen,
  onUnlock,
  onCancel,
}: ParentGateModalProps) {
  const [challenge, setChallenge] = useState<ParentGateChallenge>(() =>
    generateParentChallenge()
  );
  const [answerInput, setAnswerInput] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChallenge(generateParentChallenge());
      setAnswerInput("");
      setWrongAttempts(0);
      setErrorText(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyParentChallengeAnswer(challenge, answerInput)) {
      setAnswerInput("");
      setErrorText(null);
      onUnlock();
      return;
    }

    const nextWrong = wrongAttempts + 1;
    setWrongAttempts(nextWrong);
    setAnswerInput("");

    // Rotate the sum after 2 wrong guesses to prevent brute-force guessing
    if (nextWrong >= 2) {
      setChallenge(generateParentChallenge());
      setWrongAttempts(0);
      setErrorText("Not quite — try this new sum.");
    } else {
      setErrorText("Not quite — please check the sum.");
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-gate-heading"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-2 ring-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-sky-700">
              Grown-Ups Only
            </p>
            <h2
              id="parent-gate-heading"
              className="mt-1 text-2xl font-black text-slate-900"
            >
              🔒 Parent Check
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close parent check"
            className="touch-card flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-extrabold text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-600">
          Solve this quick sum (no audio) or hold the lock button for 3 seconds
          to open Parent Settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="rounded-2xl bg-sky-50 p-4 text-center ring-2 ring-sky-100">
            <div className="text-4xl font-black tracking-wide text-slate-900">
              {challenge.promptText} = ?
            </div>
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            autoFocus
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value.replace(/[^\d]/g, "").slice(0, 3));
              setErrorText(null);
            }}
            placeholder="Enter answer"
            aria-label={`Answer for ${challenge.promptText}`}
            className="w-full rounded-2xl border-2 border-slate-300 px-4 py-4 text-center text-2xl font-black text-slate-900 focus-visible:border-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700"
          />

          {errorText && (
            <p
              role="alert"
              className="rounded-xl bg-amber-100 px-3 py-2 text-center text-sm font-bold text-amber-950"
            >
              {errorText}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <ParentGateTrigger
              onUnlock={onUnlock}
              onRequestChallenge={() => {
                setChallenge(generateParentChallenge());
                setAnswerInput("");
                setErrorText(null);
              }}
              label="Hold 3s"
            />

            <button
              type="submit"
              disabled={answerInput.trim().length === 0}
              className="touch-card flex-1 rounded-2xl bg-sky-700 px-6 py-4 text-lg font-extrabold text-white shadow-md hover:bg-sky-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
            >
              Unlock Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
