"use client";

export type SfxCue = "tap" | "snap" | "success" | "retry";

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === "suspended") {
    void sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
}

function scheduleTone(
  ctx: AudioContext,
  options: {
    startFreq: number;
    endFreq?: number;
    startOffset: number;
    duration: number;
    gain: number;
    type?: OscillatorType;
  }
): void {
  const now = ctx.currentTime + options.startOffset;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = options.type ?? "sine";
  osc.frequency.setValueAtTime(options.startFreq, now);
  if (options.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      options.endFreq,
      now + options.duration
    );
  }

  // Soft envelope to prevent clicks/pops on tablet speakers
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(options.gain, now + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + options.duration + 0.02);
}

/**
 * Lightweight, zero-dependency Web Audio API sound effects synthesizer for
 * Foundation Stage tactile cues: tap, snap, success, and gentle retry.
 */
export function playSfx(cue: SfxCue): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    switch (cue) {
      case "tap":
        scheduleTone(ctx, {
          startFreq: 520,
          endFreq: 610,
          startOffset: 0,
          duration: 0.06,
          gain: 0.075,
          type: "sine",
        });
        break;

      case "snap":
        scheduleTone(ctx, {
          startFreq: 420,
          endFreq: 680,
          startOffset: 0,
          duration: 0.075,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 740,
          endFreq: 880,
          startOffset: 0.045,
          duration: 0.065,
          gain: 0.065,
          type: "sine",
        });
        break;

      case "success":
        // Warm ascending C5 -> E5 -> G5 -> C6 sparkle
        scheduleTone(ctx, {
          startFreq: 523.25,
          startOffset: 0,
          duration: 0.12,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 659.25,
          startOffset: 0.09,
          duration: 0.12,
          gain: 0.1,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 783.99,
          startOffset: 0.18,
          duration: 0.14,
          gain: 0.11,
          type: "triangle",
        });
        scheduleTone(ctx, {
          startFreq: 1046.5,
          startOffset: 0.27,
          duration: 0.28,
          gain: 0.12,
          type: "sine",
        });
        break;

      case "retry":
        // Gentle, non-harsh warm nudge (E4 -> C4)
        scheduleTone(ctx, {
          startFreq: 329.63,
          startOffset: 0,
          duration: 0.12,
          gain: 0.075,
          type: "sine",
        });
        scheduleTone(ctx, {
          startFreq: 261.63,
          startOffset: 0.11,
          duration: 0.18,
          gain: 0.07,
          type: "sine",
        });
        break;
    }
  } catch {
    // Never interrupt child interaction if Web Audio fails on restricted devices.
  }
}
