import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ContentPackSchema,
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_SCRIPTS,
  TRY_AGAIN_AUDIO_SCRIPTS,
  type ContentPack,
  type Feedback,
  type TraceGlyphExercise,
} from "@wee-sparks/curriculum-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packsDir = path.resolve(__dirname, "../../../apps/web/src/data/packs");

function sharedFeedback(seed: string): Feedback {
  const correctAudioKey = pickPraiseAudioKey(seed);
  const encourageAudioKey = pickTryAgainAudioKey(seed);
  return {
    correctText: PRAISE_AUDIO_SCRIPTS[correctAudioKey],
    correctAudioKey,
    encourageText: TRY_AGAIN_AUDIO_SCRIPTS[encourageAudioKey],
    encourageAudioKey,
  };
}

const P1_TRACING_EXERCISES: TraceGlyphExercise[] = [
  {
    id: "p1-trace-letter-s",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "emerging",
    glyph: "s",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/s",
    antiReversalCue:
      "Start at the green 1 dot, curve left like a little snake, then curve round to the right!",
    antiReversalAudioKey: "hint/trace-s-anti-reversal",
    startPoint: { x: 64, y: 30 },
    checkpoints: [
      { x: 64, y: 30 },
      { x: 42, y: 28 },
      { x: 38, y: 44 },
      { x: 60, y: 56 },
      { x: 58, y: 74 },
      { x: 34, y: 72 },
    ],
    strokeGuidePath:
      "M 64 30 C 52 22, 34 26, 36 40 C 38 52, 64 50, 62 66 C 60 78, 42 78, 34 72",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the curvy letter s for sun starting at the green 1 dot!",
      audioKey: "prompt/p1-trace-letter-s",
      visualCueEmoji: "☀️",
    },
    hint: {
      text: "Slither back, around, and across like a friendly snake!",
      audioKey: "hint/p1-trace-letter-s",
    },
    feedback: sharedFeedback("p1-trace-letter-s"),
    offlineParentTip:
      "Practise drawing big 's' snakes in a tray of flour or sand, starting at the top right and curving left first.",
  },
  {
    id: "p1-trace-letter-p",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    glyph: "p",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/p",
    antiReversalCue:
      "Start at the green 1 dot on the left: zip straight down under the line, bounce back up, and draw a round tummy to the right!",
    antiReversalAudioKey: "hint/trace-p-anti-reversal",
    startPoint: { x: 36, y: 34 },
    checkpoints: [
      { x: 36, y: 34 },
      { x: 36, y: 60 },
      { x: 36, y: 84 },
      { x: 56, y: 36 },
      { x: 64, y: 52 },
      { x: 46, y: 62 },
    ],
    strokeGuidePath:
      "M 36 34 L 36 86 M 36 40 C 48 30, 66 36, 66 50 C 66 64, 48 68, 36 58",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter p for puffin starting at the green 1 dot!",
      audioKey: "prompt/p1-trace-letter-p",
      visualCueEmoji: "🐧",
    },
    hint: {
      text: "Go down the parrot's long tail first, then bounce up and round to the right!",
      audioKey: "hint/p1-trace-letter-p",
    },
    feedback: sharedFeedback("p1-trace-letter-p"),
    offlineParentTip:
      "Because 'p' has a descending tail, remind your child it hangs beneath the baseline just like a puffin perched on a cliff.",
  },
  {
    id: "p1-trace-letter-i",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    glyph: "i",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/i",
    antiReversalCue:
      "Start at the middle green 1 dot, go straight down with a tiny flick, then add one neat dot on top!",
    antiReversalAudioKey: "hint/trace-i-anti-reversal",
    startPoint: { x: 48, y: 40 },
    checkpoints: [
      { x: 48, y: 40 },
      { x: 48, y: 58 },
      { x: 48, y: 74 },
      { x: 58, y: 76 },
      { x: 48, y: 24 },
    ],
    strokeGuidePath: "M 48 40 L 48 72 C 48 77, 54 78, 60 75 M 48 22 L 48 26",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter i for insect starting at the green 1 dot!",
      audioKey: "prompt/p1-trace-letter-i",
      visualCueEmoji: "🐞",
    },
    hint: {
      text: "Zip straight down the body first, then tap one gentle dot on top!",
      audioKey: "hint/p1-trace-letter-i",
    },
    feedback: sharedFeedback("p1-trace-letter-i"),
    offlineParentTip:
      "Encourage a single neat dot rather than a big coloured-in circle on top of 'i'.",
  },
  {
    id: "p1-trace-letter-n",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "developing",
    glyph: "n",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/n",
    antiReversalCue:
      "Start at the green 1 dot on the left, go straight down, bounce back up the same stick, and arch over the hill!",
    antiReversalAudioKey: "hint/trace-n-anti-reversal",
    startPoint: { x: 34, y: 38 },
    checkpoints: [
      { x: 34, y: 38 },
      { x: 34, y: 74 },
      { x: 42, y: 46 },
      { x: 58, y: 40 },
      { x: 66, y: 58 },
      { x: 66, y: 76 },
    ],
    strokeGuidePath:
      "M 34 38 L 34 76 M 34 52 C 38 36, 66 36, 66 56 L 66 76",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter n for nest starting at the green 1 dot!",
      audioKey: "prompt/p1-trace-letter-n",
      visualCueEmoji: "🪺",
    },
    hint: {
      text: "Down, bounce up, and over the bridge to the right!",
      audioKey: "hint/p1-trace-letter-n",
    },
    feedback: sharedFeedback("p1-trace-letter-n"),
    offlineParentTip:
      "Remind your child to keep their pencil on the paper when bouncing up and over the arch of 'n'.",
  },
  {
    id: "p1-trace-letter-c",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-ckehrmd",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "emerging",
    glyph: "c",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/c",
    antiReversalCue:
      "Start at the green 1 dot on the right, curve back to the left and scoop gently underneath!",
    antiReversalAudioKey: "hint/trace-c-anti-reversal",
    startPoint: { x: 64, y: 36 },
    checkpoints: [
      { x: 64, y: 36 },
      { x: 44, y: 34 },
      { x: 34, y: 54 },
      { x: 46, y: 74 },
      { x: 66, y: 72 },
    ],
    strokeGuidePath:
      "M 64 36 C 52 26, 32 34, 34 54 C 36 74, 54 78, 66 70",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the curly letter c for car starting at the green 1 dot!",
      audioKey: "prompt/p1-trace-letter-c",
      visualCueEmoji: "🚗",
    },
    hint: {
      text: "Curl back to the left like a half moon — leave the front open!",
      audioKey: "hint/p1-trace-letter-c",
    },
    feedback: sharedFeedback("p1-trace-letter-c"),
    offlineParentTip:
      "Curly 'c' is the magic starter shape for a, d, g, o, and q — practise curving anti-clockwise from the top right.",
  },
  {
    id: "p1-trace-letter-m",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-ckehrmd",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "developing",
    glyph: "m",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/m",
    antiReversalCue:
      "Start on the left green 1 dot, zip down, then hop over two smooth mountains to the right!",
    antiReversalAudioKey: "hint/trace-m-anti-reversal",
    startPoint: { x: 22, y: 40 },
    checkpoints: [
      { x: 22, y: 40 },
      { x: 22, y: 76 },
      { x: 38, y: 42 },
      { x: 50, y: 74 },
      { x: 64, y: 42 },
      { x: 78, y: 76 },
    ],
    strokeGuidePath:
      "M 22 40 L 22 76 M 22 54 C 24 36, 50 36, 50 56 L 50 76 M 50 54 C 52 36, 78 36, 78 56 L 78 76",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter m for moon over two smooth hills!",
      audioKey: "prompt/p1-trace-letter-m",
      visualCueEmoji: "🌙",
    },
    hint: {
      text: "Down the first line, up and over mountain 1, up and over mountain 2!",
      audioKey: "hint/p1-trace-letter-m",
    },
    feedback: sharedFeedback("p1-trace-letter-m"),
    offlineParentTip:
      "Chant 'Down, mountain, mountain!' as your child draws 'm' on lined paper or a mini whiteboard.",
  },
  {
    id: "p1-trace-numeral-2",
    type: "trace-glyph",
    skillId: "ccea-p1-num-subitise-1-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "emerging",
    glyph: "2",
    glyphKind: "numeral",
    glyphAudioKey: "number/2",
    antiReversalCue:
      "Start at the green 1 dot on the left, curve up and around to the right, slide down left, then zoom straight across the bottom!",
    antiReversalAudioKey: "hint/trace-2-anti-reversal",
    startPoint: { x: 32, y: 34 },
    checkpoints: [
      { x: 32, y: 34 },
      { x: 54, y: 26 },
      { x: 64, y: 42 },
      { x: 46, y: 60 },
      { x: 30, y: 76 },
      { x: 68, y: 76 },
    ],
    strokeGuidePath:
      "M 32 34 C 36 20, 66 20, 64 40 C 62 52, 44 62, 30 76 L 68 76",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 2 for 2 bouncy wheels!",
      audioKey: "prompt/p1-trace-numeral-2",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Around and back on a railway track — two, two, two!",
      audioKey: "hint/p1-trace-numeral-2",
    },
    feedback: sharedFeedback("p1-trace-numeral-2"),
    offlineParentTip:
      "Use the rhyme 'Around and back on a railway track' to help prevent mirror-reversed 2s.",
  },
  {
    id: "p1-trace-numeral-4",
    type: "trace-glyph",
    skillId: "ccea-p1-num-subitise-1-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    glyph: "4",
    glyphKind: "numeral",
    glyphAudioKey: "number/4",
    antiReversalCue:
      "Start at the top green 1 dot: go down, turn across to the right, then lift and draw one straight line down!",
    antiReversalAudioKey: "hint/trace-4-anti-reversal",
    startPoint: { x: 36, y: 24 },
    checkpoints: [
      { x: 36, y: 24 },
      { x: 32, y: 54 },
      { x: 68, y: 54 },
      { x: 58, y: 26 },
      { x: 58, y: 78 },
    ],
    strokeGuidePath: "M 36 24 L 30 54 L 70 54 M 58 24 L 58 78",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 4 for 4 dinosaur legs!",
      audioKey: "prompt/p1-trace-numeral-4",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Down and across, then cut straight down the middle to make 4!",
      audioKey: "hint/p1-trace-numeral-4",
    },
    feedback: sharedFeedback("p1-trace-numeral-4"),
    offlineParentTip:
      "Practise open-top 4s ('Down, across, and down once more') — the clearest Foundation Stage numeral style.",
  },
];

const P2_TRACING_EXERCISES: TraceGlyphExercise[] = [
  {
    id: "p2-trace-numeral-6",
    type: "trace-glyph",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    glyph: "6",
    glyphKind: "numeral",
    glyphAudioKey: "number/6",
    antiReversalCue:
      "Start high at the green 1 dot, swoop down the left side and curl a cosy circle at the bottom!",
    antiReversalAudioKey: "hint/trace-6-anti-reversal",
    startPoint: { x: 60, y: 22 },
    checkpoints: [
      { x: 60, y: 22 },
      { x: 38, y: 38 },
      { x: 34, y: 64 },
      { x: 52, y: 78 },
      { x: 66, y: 62 },
      { x: 46, y: 50 },
    ],
    strokeGuidePath:
      "M 60 22 C 42 26, 32 46, 34 64 C 36 80, 66 80, 66 62 C 66 48, 44 46, 36 58",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 6 starting high at the green 1 dot!",
      audioKey: "prompt/p2-trace-numeral-6",
      visualCueEmoji: "⭐",
    },
    hint: {
      text: "Down to a loop — a six rolls a hoop!",
      audioKey: "hint/p2-trace-numeral-6",
    },
    feedback: sharedFeedback("p2-trace-numeral-6"),
    offlineParentTip:
      "Compare 6 (loop at the bottom) with 9 (loop at the top) using playdough snakes.",
  },
  {
    id: "p2-trace-numeral-7",
    type: "trace-glyph",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "emerging",
    glyph: "7",
    glyphKind: "numeral",
    glyphAudioKey: "number/7",
    antiReversalCue:
      "Start on the top-left green 1 dot, zoom straight across the sky to the right, then slide diagonally down to the left!",
    antiReversalAudioKey: "hint/trace-7-anti-reversal",
    startPoint: { x: 30, y: 26 },
    checkpoints: [
      { x: 30, y: 26 },
      { x: 50, y: 26 },
      { x: 68, y: 26 },
      { x: 54, y: 52 },
      { x: 42, y: 78 },
    ],
    strokeGuidePath: "M 30 26 L 68 26 L 42 78",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 7 across the sky and down the slide!",
      audioKey: "prompt/p2-trace-numeral-7",
      visualCueEmoji: "🚀",
    },
    hint: {
      text: "Across the sky and down from heaven — that is the way to make a 7!",
      audioKey: "hint/p2-trace-numeral-7",
    },
    feedback: sharedFeedback("p2-trace-numeral-7"),
    offlineParentTip:
      "Remind your child that 7 always starts on the left and zooms right before sliding down — this stops backwards 7s.",
  },
  {
    id: "p2-trace-numeral-8",
    type: "trace-glyph",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    glyph: "8",
    glyphKind: "numeral",
    glyphAudioKey: "number/8",
    antiReversalCue:
      "Start at the top green 1 dot, curve an S down to the bottom, then climb back up to close the gate!",
    antiReversalAudioKey: "hint/trace-8-anti-reversal",
    startPoint: { x: 52, y: 22 },
    checkpoints: [
      { x: 52, y: 22 },
      { x: 34, y: 34 },
      { x: 50, y: 48 },
      { x: 66, y: 64 },
      { x: 50, y: 78 },
      { x: 34, y: 64 },
      { x: 64, y: 34 },
    ],
    strokeGuidePath:
      "M 52 22 C 32 22, 30 42, 50 48 C 70 54, 70 78, 50 78 C 30 78, 30 54, 50 48 C 70 42, 68 22, 52 22",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 8 like a racetrack loop!",
      audioKey: "prompt/p2-trace-numeral-8",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Make an S and do not wait — climb back up to make an 8!",
      audioKey: "hint/p2-trace-numeral-8",
    },
    feedback: sharedFeedback("p2-trace-numeral-8"),
    offlineParentTip:
      "Encourage drawing 8 in one continuous racetrack motion rather than stacking two separate circles.",
  },
  {
    id: "p2-trace-numeral-9",
    type: "trace-glyph",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "animals",
    difficulty: "developing",
    glyph: "9",
    glyphKind: "numeral",
    glyphAudioKey: "number/9",
    antiReversalCue:
      "Start at the green 1 dot on the right, make a round loop to the left, close it up, then drop straight down!",
    antiReversalAudioKey: "hint/trace-9-anti-reversal",
    startPoint: { x: 64, y: 34 },
    checkpoints: [
      { x: 64, y: 34 },
      { x: 44, y: 24 },
      { x: 34, y: 40 },
      { x: 52, y: 50 },
      { x: 64, y: 38 },
      { x: 64, y: 78 },
    ],
    strokeGuidePath:
      "M 64 34 C 58 20, 34 22, 34 38 C 34 52, 54 54, 64 42 L 64 26 L 64 78",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 9: a neat loop at the top and a straight line down!",
      audioKey: "prompt/p2-trace-numeral-9",
      visualCueEmoji: "🐧",
    },
    hint: {
      text: "Make a hoop and then a line — that is the way to make a 9!",
      audioKey: "hint/p2-trace-numeral-9",
    },
    feedback: sharedFeedback("p2-trace-numeral-9"),
    offlineParentTip:
      "Because 9 starts with the same anti-clockwise curve as 'a' and 'c', link them together during writing practice.",
  },
  {
    id: "p2-trace-digraph-sh",
    type: "trace-glyph",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "developing",
    glyph: "sh",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/sh",
    antiReversalCue:
      "Trace the curvy s on the left first, then start tall for h and bounce over the hill to make the /sh/ team!",
    antiReversalAudioKey: "hint/trace-sh-anti-reversal",
    startPoint: { x: 40, y: 42 },
    checkpoints: [
      { x: 40, y: 42 },
      { x: 24, y: 48 },
      { x: 40, y: 66 },
      { x: 24, y: 74 },
      { x: 54, y: 22 },
      { x: 54, y: 74 },
      { x: 74, y: 52 },
      { x: 76, y: 74 },
    ],
    strokeGuidePath:
      "M 40 42 C 30 36, 20 44, 24 52 C 28 58, 44 60, 40 70 C 36 78, 24 76, 20 72 M 54 22 L 54 76 M 54 54 C 58 40, 76 42, 76 58 L 76 76",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the digraph team sh for ship!",
      audioKey: "prompt/p2-trace-digraph-sh",
      visualCueEmoji: "🚢",
    },
    hint: {
      text: "Trace s on the left, then tall h on the right — together they say /sh/!",
      audioKey: "hint/p2-trace-digraph-sh",
    },
    feedback: sharedFeedback("p2-trace-digraph-sh"),
    offlineParentTip:
      "Underline 'sh' with one single line underneath so your child sees two letters working together for one sound.",
  },
  {
    id: "p2-trace-digraph-ch",
    type: "trace-glyph",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "animals",
    difficulty: "secure",
    glyph: "ch",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/ch",
    antiReversalCue:
      "Curl c back to the left first, then draw tall h down and over the hill to build the /ch/ team!",
    antiReversalAudioKey: "hint/trace-ch-anti-reversal",
    startPoint: { x: 42, y: 44 },
    checkpoints: [
      { x: 42, y: 44 },
      { x: 24, y: 58 },
      { x: 42, y: 74 },
      { x: 54, y: 22 },
      { x: 54, y: 74 },
      { x: 74, y: 52 },
      { x: 76, y: 74 },
    ],
    strokeGuidePath:
      "M 42 44 C 30 36, 20 46, 22 60 C 24 74, 36 78, 44 72 M 54 22 L 54 76 M 54 54 C 58 40, 76 42, 76 58 L 76 76",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the digraph team ch for chip!",
      audioKey: "prompt/p2-trace-digraph-ch",
      visualCueEmoji: "🍟",
    },
    hint: {
      text: "Curl c first, then start tall at the top for h — together they say /ch/!",
      audioKey: "hint/p2-trace-digraph-ch",
    },
    feedback: sharedFeedback("p2-trace-digraph-ch"),
    offlineParentTip:
      "Play 'ch' train: say 'ch-ch-ch' while tracing c and h side by side on a chalkboard or paper.",
  },
];

const PACKS: Array<{ filename: string; pack: ContentPack }> = [
  {
    filename: "p1-tracing-studio.json",
    pack: {
      packId: "ccea-p1-tracing-studio",
      version: "1.0.0",
      title: "P1 Guided Tracing Studio: Stage 1 Letters & Numerals",
      description:
        "Guided anti-reversal letter (s, p, i, n, c, m) and numeral (2, 4) tracing pack aligned to Northern Ireland CCEA Foundation Stage P1.",
      yearGroup: "P1",
      locale: "en-GB-NI",
      skillIds: [
        "ccea-p1-lit-initial-satpin",
        "ccea-p1-lit-initial-ckehrmd",
        "ccea-p1-num-subitise-1-5",
      ],
      exercises: P1_TRACING_EXERCISES,
    },
  },
  {
    filename: "p2-tracing-studio.json",
    pack: {
      packId: "ccea-p2-tracing-studio",
      version: "1.0.0",
      title: "P2 Guided Tracing Studio: Numerals 6–9 & Digraph Teams",
      description:
        "Guided anti-reversal numeral (6, 7, 8, 9) and Linguistic Phonics digraph (sh, ch) tracing pack aligned to Northern Ireland CCEA Foundation Stage P2.",
      yearGroup: "P2",
      locale: "en-GB-NI",
      skillIds: [
        "ccea-p2-num-bonds-to-10",
        "ccea-p2-lit-digraphs-sh-ch-th-ng",
      ],
      exercises: P2_TRACING_EXERCISES,
    },
  },
];

mkdirSync(packsDir, { recursive: true });

for (const { filename, pack } of PACKS) {
  const validated = ContentPackSchema.parse(pack);
  const outPath = path.join(packsDir, filename);
  writeFileSync(outPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  console.log(
    `✓ Wrote tracing pack ${filename} (${validated.yearGroup}, ${validated.exercises.length} trace-glyph exercises)`
  );
}
