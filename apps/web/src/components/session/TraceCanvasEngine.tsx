"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TraceGlyphExercise, TracePoint } from "@wee-sparks/curriculum-schema";
import { playAudioKey, playPhoneme, playSfx } from "@/lib/audio";

interface TraceCanvasEngineProps {
  exercise: TraceGlyphExercise;
  isSolved: boolean;
  onAttempt: (isCorrect: boolean) => void;
}

type Stroke = TracePoint[];

const CHECKPOINT_RADIUS = 14;
const HESITATION_MS = 9000;

function distance(a: TracePoint, b: TracePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function computeHitCheckpoints(
  strokes: readonly Stroke[],
  checkpoints: readonly TracePoint[]
): Set<number> {
  const hit = new Set<number>();
  for (const stroke of strokes) {
    for (const pt of stroke) {
      checkpoints.forEach((cp, idx) => {
        if (distance(pt, cp) <= CHECKPOINT_RADIUS) {
          hit.add(idx);
        }
      });
    }
  }
  return hit;
}

/**
 * Guided letter/numeral tracing engine on an HTML5 canvas with:
 * - Smooth quadratic-curve ink rendering for touchscreens & mouse/trackpads
 * - Pulsing green Start Beacon + ordered stroke checkpoints
 * - Anti-reversal left-anchor stripe & audio cue
 * - Hesitation / 2-miss next-checkpoint visual glow beacon
 */
export function TraceCanvasEngine({
  exercise,
  isSolved,
  onAttempt,
}: TraceCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const activeStrokeRef = useRef<Stroke>([]);

  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [hitCheckpoints, setHitCheckpoints] = useState<Set<number>>(
    () => new Set()
  );
  const [startedNearStart, setStartedNearStart] = useState(false);
  const [shakePad, setShakePad] = useState(false);
  const [misses, setMisses] = useState(0);
  const [isHesitating, setIsHesitating] = useState(false);
  const [activityTick, setActivityTick] = useState(0);

  const redrawCanvas = useCallback(
    (allStrokes: readonly Stroke[], current?: Stroke) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0284C7";
      ctx.lineWidth = Math.max(12, width * 0.048);

      const drawStroke = (stroke: readonly TracePoint[]) => {
        if (stroke.length === 0) return;
        ctx.beginPath();
        const first = stroke[0]!;
        ctx.moveTo((first.x / 100) * width, (first.y / 100) * height);

        if (stroke.length === 1) {
          ctx.lineTo(
            (first.x / 100) * width + 0.5,
            (first.y / 100) * height + 0.5
          );
        } else {
          for (let i = 1; i < stroke.length - 1; i += 1) {
            const curr = stroke[i]!;
            const next = stroke[i + 1]!;
            const cx = (curr.x / 100) * width;
            const cy = (curr.y / 100) * height;
            const mx = (((curr.x + next.x) / 2) / 100) * width;
            const my = (((curr.y + next.y) / 2) / 100) * height;
            ctx.quadraticCurveTo(cx, cy, mx, my);
          }
          const last = stroke[stroke.length - 1]!;
          ctx.lineTo((last.x / 100) * width, (last.y / 100) * height);
        }
        ctx.stroke();
      };

      for (const s of allStrokes) drawStroke(s);
      if (current && current.length > 0) drawStroke(current);
    },
    []
  );

  useEffect(() => {
    setStrokes([]);
    setHitCheckpoints(new Set());
    setStartedNearStart(false);
    setShakePad(false);
    setMisses(0);
    setIsHesitating(false);
    setActivityTick(0);
    activeStrokeRef.current = [];
    drawingRef.current = false;
    redrawCanvas([]);
  }, [exercise, redrawCanvas]);

  useEffect(() => {
    if (isSolved) {
      setIsHesitating(false);
      return;
    }
    setIsHesitating(false);
    const id = window.setTimeout(() => setIsHesitating(true), HESITATION_MS);
    return () => window.clearTimeout(id);
  }, [exercise, activityTick, isSolved]);

  useEffect(() => {
    redrawCanvas(strokes);
  }, [strokes, redrawCanvas]);

  const showVisualHint = !isSolved && (misses >= 2 || isHesitating);
  const nextUnhitIndex = exercise.checkpoints.findIndex(
    (_, idx) => !hitCheckpoints.has(idx)
  );

  const toNormalisedPoint = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): TracePoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSolved) return;
    setActivityTick((t) => t + 1);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = toNormalisedPoint(e);
    drawingRef.current = true;
    activeStrokeRef.current = [pt];

    if (distance(pt, exercise.startPoint) <= CHECKPOINT_RADIUS + 4) {
      setStartedNearStart(true);
      playSfx("tap");
    }

    setHitCheckpoints((prev) => {
      const next = new Set(prev);
      let added = false;
      exercise.checkpoints.forEach((cp, idx) => {
        if (!next.has(idx) && distance(pt, cp) <= CHECKPOINT_RADIUS) {
          next.add(idx);
          added = true;
        }
      });
      if (added) playSfx("snap");
      return added ? next : prev;
    });

    redrawCanvas(strokes, activeStrokeRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || isSolved) return;
    const pt = toNormalisedPoint(e);
    activeStrokeRef.current = [...activeStrokeRef.current, pt];

    setHitCheckpoints((prev) => {
      const next = new Set(prev);
      let added = false;
      exercise.checkpoints.forEach((cp, idx) => {
        if (!next.has(idx) && distance(pt, cp) <= CHECKPOINT_RADIUS) {
          next.add(idx);
          added = true;
        }
      });
      if (added) playSfx("snap");
      return added ? next : prev;
    });

    redrawCanvas(strokes, activeStrokeRef.current);
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setActivityTick((t) => t + 1);
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = [];
    if (finished.length > 0) {
      setStrokes((prev) => [...prev, finished]);
    }
  };

  const handleUndo = () => {
    if (isSolved || strokes.length === 0) return;
    setActivityTick((t) => t + 1);
    playSfx("tap");
    const nextStrokes = strokes.slice(0, -1);
    setStrokes(nextStrokes);
    const recomputed = computeHitCheckpoints(nextStrokes, exercise.checkpoints);
    setHitCheckpoints(recomputed);
    if (nextStrokes.length === 0) setStartedNearStart(false);
  };

  const handleClear = () => {
    if (isSolved) return;
    setActivityTick((t) => t + 1);
    playSfx("tap");
    setStrokes([]);
    setHitCheckpoints(new Set());
    setStartedNearStart(false);
    redrawCanvas([]);
  };

  const handleCheck = () => {
    if (isSolved) return;
    setActivityTick((t) => t + 1);
    const coverage =
      exercise.checkpoints.length > 0
        ? hitCheckpoints.size / exercise.checkpoints.length
        : 0;
    const isCorrect =
      coverage >= exercise.requiredCoverage &&
      (startedNearStart || hitCheckpoints.has(0));

    if (!isCorrect) {
      setMisses((m) => m + 1);
      setShakePad(true);
      window.setTimeout(() => setShakePad(false), 450);
    } else if (exercise.glyphKind === "letter") {
      void playPhoneme(exercise.glyph, exercise.glyphAudioKey);
    } else {
      void playAudioKey(exercise.glyphAudioKey, exercise.glyph);
    }

    onAttempt(isCorrect);
  };

  const totalDots = exercise.checkpoints.length;
  const hitCount = hitCheckpoints.size;

  return (
    <div className="space-y-5">
      {/* Anti-Reversal Cue Banner with Audio */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setActivityTick((t) => t + 1);
            playSfx("tap");
            void playAudioKey(
              exercise.antiReversalAudioKey,
              exercise.antiReversalCue
            );
          }}
          className="touch-card flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-3 text-left text-sm font-extrabold text-emerald-950 ring-2 ring-emerald-200 hover:bg-emerald-100 sm:text-base"
        >
          <span className="text-2xl" aria-hidden="true">
            🟢
          </span>
          <span>{exercise.antiReversalCue}</span>
        </button>

        <span className="rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-black text-sky-950">
          Checkpoints: {hitCount} / {totalDots}
        </span>
      </div>

      {showVisualHint && (
        <div className="mx-auto max-w-md rounded-2xl bg-amber-100 px-4 py-2 text-center text-sm font-extrabold text-amber-950 ring-2 ring-amber-300">
          💡{" "}
          {nextUnhitIndex === 0
            ? "Put your finger on the glowing green 1 dot to begin!"
            : nextUnhitIndex > 0
            ? "Follow the pulsing golden dot along the dashed path!"
            : "Great trace! Tap ✅ Check Trace!"}
        </div>
      )}

      {/* Guided Tracing Pad with Left Anti-Reversal Anchor Stripe */}
      <div
        className={`relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-3xl border-4 bg-white shadow-inner ${
          isSolved
            ? "border-emerald-500 ring-4 ring-emerald-200"
            : showVisualHint
            ? "border-amber-400 ring-4 ring-amber-200"
            : "border-sky-300"
        } ${shakePad ? "animate-gentle-shake" : ""}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex w-3 flex-col items-center justify-center bg-gradient-to-b from-emerald-400 via-sky-300 to-amber-300 opacity-70"
        />

        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <line x1="8" y1="22" x2="94" y2="22" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="8" y1="50" x2="94" y2="50" stroke="#CBD5E1" strokeWidth="0.9" strokeDasharray="3 3" />
          <line x1="8" y1="78" x2="94" y2="78" stroke="#94A3B8" strokeWidth="1.2" />

          <path
            d={exercise.strokeGuidePath}
            fill="none"
            stroke="#E0F2FE"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={exercise.strokeGuidePath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {exercise.checkpoints.map((cp, idx) => {
            const isHit = hitCheckpoints.has(idx);
            const isFirst = idx === 0;
            const isNextBeacon = showVisualHint && idx === nextUnhitIndex;

            return (
              <g key={idx}>
                {isNextBeacon && (
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r="8.5"
                    fill="#F59E0B"
                    opacity="0.35"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={cp.x}
                  cy={cp.y}
                  r={isFirst ? 5.2 : isNextBeacon ? 4.8 : 3.6}
                  fill={isHit ? "#10B981" : isFirst ? "#22C55E" : "#F59E0B"}
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                />
                {isFirst && (
                  <text
                    x={cp.x}
                    y={cp.y + 1.8}
                    textAnchor="middle"
                    fontSize="5.2"
                    fontWeight="900"
                    fill="#FFFFFF"
                  >
                    1
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          style={{ touchAction: "none" }}
          aria-label={`Trace ${exercise.glyphKind} ${exercise.glyph}`}
          className="relative z-10 h-full w-full cursor-crosshair"
        />
      </div>

      {/* Chunky Canvas Controls (>= 64px x 64px) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={isSolved || strokes.length === 0}
          onClick={handleUndo}
          className="touch-card rounded-2xl bg-slate-100 px-6 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-45"
        >
          ↩️ Undo
        </button>

        <button
          type="button"
          disabled={isSolved || strokes.length === 0}
          onClick={handleClear}
          className="touch-card rounded-2xl bg-slate-100 px-6 py-4 text-lg font-extrabold text-slate-800 hover:bg-slate-200 disabled:opacity-45"
        >
          🔄 Clear
        </button>

        <button
          type="button"
          disabled={isSolved || strokes.length === 0}
          onClick={handleCheck}
          className={`touch-card rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-extrabold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 ${
            showVisualHint && nextUnhitIndex === -1 ? "animate-hint-glow" : ""
          }`}
        >
          ✅ Check Trace!
        </button>
      </div>
    </div>
  );
}
