import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ContentPackSchema,
  getMicroSkillById,
  type DifficultyTier,
  type Exercise,
  type MicroSkillId,
  type Theme,
  type UkCoin,
} from "@wee-sparks/curriculum-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "apps",
  "web",
  "src",
  "data",
  "packs"
);

const THEMES: readonly Theme[] = ["space", "dinosaurs", "animals", "vehicles"];
const TIERS: readonly DifficultyTier[] = [
  "emerging",
  "emerging",
  "emerging",
  "developing",
  "developing",
  "developing",
  "developing",
  "secure",
  "secure",
  "secure",
];

const THEME_COUNTERS: Record<
  Theme,
  { emoji: string; label: string; colour: string; audioKey: string }
> = {
  space: {
    emoji: "⭐",
    label: "stars",
    colour: "#F59E0B",
    audioKey: "object/star",
  },
  dinosaurs: {
    emoji: "🦕",
    label: "dinosaurs",
    colour: "#10B981",
    audioKey: "object/dino",
  },
  animals: {
    emoji: "🦊",
    label: "foxes",
    colour: "#F97316",
    audioKey: "object/fox",
  },
  vehicles: {
    emoji: "🚀",
    label: "rockets",
    colour: "#0284C7",
    audioKey: "object/rocket",
  },
};

function themeAt(idx: number): Theme {
  return THEMES[idx % THEMES.length]!;
}

function tierAt(idx: number): DifficultyTier {
  return TIERS[idx % TIERS.length]!;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function makeNumberOptions(
  target: number,
  minVal: number,
  maxVal: number
): {
  options: Array<{
    id: string;
    label: string;
    displayText: string;
    audioKey: string;
  }>;
  correctOptionId: string;
} {
  const candidates = new Set<number>([target]);
  const offsets = [-2, -1, 1, 2, 3, -3, 4];
  for (const off of offsets) {
    if (candidates.size >= 4) break;
    const n = target + off;
    if (n >= minVal && n <= maxVal) candidates.add(n);
  }
  const sorted = Array.from(candidates).sort((a, b) => a - b);
  return {
    options: sorted.map((n) => ({
      id: `n-${n}`,
      label: String(n),
      displayText: String(n),
      audioKey: `number/${n}`,
    })),
    correctOptionId: `n-${target}`,
  };
}

function buildInitialSoundBatch(
  skillId: MicroSkillId,
  prefix: string,
  items: ReadonlyArray<{
    sound: string;
    word: string;
    emoji: string;
    distractors: ReadonlyArray<{ word: string; emoji: string; sound: string }>;
  }>
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return items.map((item, idx) => {
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const mode = idx % 2 === 0 ? "sound-to-picture" : "picture-to-grapheme";
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);

    const options =
      mode === "sound-to-picture"
        ? [
            {
              id: `opt-${slug(item.word)}`,
              label: item.word,
              displayText: item.word,
              emoji: item.emoji,
              audioKey: `word/${slug(item.word)}`,
            },
            ...item.distractors.map((d) => ({
              id: `opt-${slug(d.word)}`,
              label: d.word,
              displayText: d.word,
              emoji: d.emoji,
              audioKey: `word/${slug(d.word)}`,
            })),
          ]
        : [
            {
              id: `opt-${slug(item.sound)}`,
              label: item.sound,
              displayText: item.sound,
              audioKey: `phoneme/${slug(item.sound)}`,
            },
            ...item.distractors.map((d) => ({
              id: `opt-${slug(d.sound)}`,
              label: d.sound,
              displayText: d.sound,
              audioKey: `phoneme/${slug(d.sound)}`,
            })),
          ];

    // Deterministically rotate option order so correct answer isn't always first
    const shift = idx % options.length;
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];

    return {
      id,
      type: "initial-sound-match",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "literacy",
      theme,
      difficulty,
      mode,
      targetSound: item.sound,
      targetSoundAudioKey: `phoneme/${slug(item.sound)}`,
      stimulus: {
        label: item.word,
        emoji: item.emoji,
        audioKey: `word/${slug(item.word)}`,
      },
      options: rotated,
      correctOptionId:
        mode === "sound-to-picture"
          ? `opt-${slug(item.word)}`
          : `opt-${slug(item.sound)}`,
      prompt: {
        text:
          mode === "sound-to-picture"
            ? `Tap the picture that starts with /${item.sound}/!`
            : `Which sound starts "${item.word}"?`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: mode === "sound-to-picture" ? "🔊" : item.emoji,
      },
      hint: {
        text: `Say "${item.word}" slowly — listen for the very first pure sound /${item.sound}/.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Brilliant! "${item.word}" starts with /${item.sound}/!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Good try! Listen closely to the start of "${item.word}".`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildBlendingBatch(
  skillId: MicroSkillId,
  prefix: string,
  items: ReadonlyArray<{
    word: string;
    phonemes: readonly string[];
    emoji: string;
    distractors: ReadonlyArray<{ word: string; emoji: string }>;
  }>,
  startIndex = 0
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return items.map((item, i) => {
    const idx = startIndex + i;
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);

    const options = [
      {
        id: `opt-${slug(item.word)}`,
        label: item.word,
        displayText: item.word,
        emoji: item.emoji,
        audioKey: `word/${slug(item.word)}`,
      },
      ...item.distractors.map((d) => ({
        id: `opt-${slug(d.word)}`,
        label: d.word,
        displayText: d.word,
        emoji: d.emoji,
        audioKey: `word/${slug(d.word)}`,
      })),
    ];
    const shift = idx % options.length;
    const rotated = [...options.slice(shift), ...options.slice(0, shift)];

    return {
      id,
      type: "cvc-blending",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "literacy",
      theme,
      difficulty,
      targetWord: item.word,
      wordAudioKey: `word/${slug(item.word)}`,
      phonemes: item.phonemes.map((g) => ({
        grapheme: g,
        audioKey: `phoneme/${slug(g)}`,
      })),
      options: rotated,
      correctOptionId: `opt-${slug(item.word)}`,
      prompt: {
        text: `Blend the sounds together to find "${item.word}"!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: "🔤",
      },
      hint: {
        text: `Tap each sound box from left to right: ${item.phonemes.join(" - ")}.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Super blending! ${item.phonemes.join("-")} makes "${item.word}"!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Almost! Slide your finger across the sounds and listen again.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildSegmentBatch(
  skillId: MicroSkillId,
  prefix: string,
  items: ReadonlyArray<{
    word: string;
    graphemes: readonly string[];
    emoji: string;
    extras: readonly string[];
  }>,
  startIndex = 0
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return items.map((item, i) => {
    const idx = startIndex + i;
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);

    const bank = [...item.graphemes, ...item.extras].map((g, gIdx) => ({
      id: `${id}-tile-${gIdx}-${slug(g)}`,
      grapheme: g,
      audioKey: `phoneme/${slug(g)}`,
    }));
    const shift = (idx + 1) % bank.length;
    const rotatedBank = [...bank.slice(shift), ...bank.slice(0, shift)];

    return {
      id,
      type: "phoneme-segment",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "literacy",
      theme,
      difficulty,
      targetWord: item.word,
      wordAudioKey: `word/${slug(item.word)}`,
      stimulusEmoji: item.emoji,
      correctGraphemes: [...item.graphemes],
      tileBank: rotatedBank,
      prompt: {
        text: `Build the word "${item.word}" in the sound boxes!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: item.emoji,
      },
      hint: {
        text: `Stretch "${item.word}" slowly — the first sound is /${item.graphemes[0]}/.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Spot on! You spelled "${item.word}" sound by sound!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Have another go — tap each box to listen to the sounds in "${item.word}".`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildHfwOrCaptionBatch(
  skillId: MicroSkillId,
  prefix: string,
  items: ReadonlyArray<{
    targetWord: string;
    sentence: string;
    emoji: string;
    distractors: readonly string[];
  }>
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return items.map((item, idx) => {
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const allWords = [item.targetWord, ...item.distractors];
    const shift = idx % allWords.length;
    const rotated = [...allWords.slice(shift), ...allWords.slice(0, shift)];

    return {
      id,
      type: "high-frequency-word",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "literacy",
      theme,
      difficulty,
      targetWord: item.targetWord,
      targetWordAudioKey: `word/${slug(item.targetWord)}`,
      contextSentence: item.sentence,
      contextAudioKey: `sentence/${id}`,
      stimulusEmoji: item.emoji,
      options: rotated.map((w) => ({
        id: `opt-${slug(w)}`,
        label: w,
        displayText: w,
        audioKey: `word/${slug(w)}`,
      })),
      correctOptionId: `opt-${slug(item.targetWord)}`,
      prompt: {
        text: `Tap the missing word to complete the sentence!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: item.emoji,
      },
      hint: {
        text: `Tap the sentence card to hear it read aloud, then find "${item.targetWord}".`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Well done! "${item.sentence.replace("___", item.targetWord)}"`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Good try! Listen to the sentence again and spot the matching word.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildTenFrameBatch(
  skillId: MicroSkillId,
  prefix: string,
  frameSize: 10 | 20,
  specs: ReadonlyArray<{
    mode: "count-to-numeral" | "build-on-frame";
    target: number;
    initial: number;
  }>
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  const minOpt = frameSize === 20 ? 10 : 1;
  const maxOpt = frameSize === 20 ? 20 : 10;

  return specs.map((spec, idx) => {
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const counter = THEME_COUNTERS[theme];

    if (spec.mode === "count-to-numeral") {
      const { options, correctOptionId } = makeNumberOptions(
        spec.target,
        minOpt,
        maxOpt
      );
      return {
        id,
        type: "ten-frame-count",
        skillId,
        yearGroup: skill.yearGroup,
        subject: "numeracy",
        theme,
        difficulty,
        mode: "count-to-numeral",
        frameSize,
        targetNumber: spec.target,
        initialCounters: spec.target,
        counterVisual: counter,
        options,
        correctOptionId,
        prompt: {
          text: `How many ${counter.label} are on the ${frameSize === 20 ? "double Ten-Frame" : "Ten-Frame"}?`,
          audioKey: `prompt/${id}`,
          visualCueEmoji: counter.emoji,
        },
        hint: {
          text:
            frameSize === 20
              ? `The first frame is a full 10 — count on from 10 to find the total.`
              : `A full top row is 5 — tap each counter to count carefully.`,
          audioKey: `hint/${id}`,
        },
        feedback: {
          correctText: `Brilliant counting! There are ${spec.target} ${counter.label}!`,
          correctAudioKey: `feedback/correct-${id}`,
          encourageText: `Almost! Tap each ${counter.label.slice(0, -1)} to count one by one.`,
          encourageAudioKey: `feedback/encourage-${id}`,
        },
        offlineParentTip: skill.offlineParentTip,
      };
    }

    return {
      id,
      type: "ten-frame-count",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "numeracy",
      theme,
      difficulty,
      mode: "build-on-frame",
      frameSize,
      targetNumber: spec.target,
      initialCounters: spec.initial,
      counterVisual: counter,
      prompt: {
        text: `Put ${spec.target} ${counter.label} on the ${frameSize === 20 ? "double Ten-Frame" : "Ten-Frame"}!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: counter.emoji,
      },
      hint: {
        text: `You have ${spec.initial} already — add ${spec.target - spec.initial} more to reach ${spec.target}.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Fantastic! You built ${spec.target} on the frame!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Not quite ${spec.target} yet — count your counters and try again!`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildNumberBondBatch(
  skillId: MicroSkillId,
  prefix: string,
  specs: ReadonlyArray<{ whole: number; givenPart: number }>,
  startIndex = 0
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return specs.map((spec, i) => {
    const idx = startIndex + i;
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const counter = THEME_COUNTERS[theme];
    const missingPart = spec.whole - spec.givenPart;
    const { options, correctOptionId } = makeNumberOptions(
      missingPart,
      0,
      spec.whole
    );

    return {
      id,
      type: "number-bond",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "numeracy",
      theme,
      difficulty,
      whole: spec.whole,
      givenPart: spec.givenPart,
      missingPart,
      counterVisual: counter,
      options,
      correctOptionId,
      prompt: {
        text: `${spec.givenPart} and how many more make ${spec.whole}?`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: counter.emoji,
      },
      hint: {
        text: `Start at ${spec.givenPart} and count on your fingers up to ${spec.whole}.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Yes! ${spec.givenPart} + ${missingPart} = ${spec.whole}!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Have another go — count up from ${spec.givenPart} to ${spec.whole}.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildNumberLineBatch(
  skillId: MicroSkillId,
  prefix: string,
  max: 10 | 20,
  specs: ReadonlyArray<{
    start: number;
    op: "add" | "subtract";
    hops: number;
  }>,
  startIndex = 0
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return specs.map((spec, i) => {
    const idx = startIndex + i;
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const counter = THEME_COUNTERS[theme];
    const target =
      spec.op === "add" ? spec.start + spec.hops : spec.start - spec.hops;

    return {
      id,
      type: "number-line-hop",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "numeracy",
      theme,
      difficulty,
      min: 0,
      max,
      startNumber: spec.start,
      operation: spec.op,
      hops: spec.hops,
      targetNumber: target,
      hopperVisual: {
        emoji: counter.emoji,
        label: counter.label,
        audioKey: counter.audioKey,
      },
      prompt: {
        text:
          spec.op === "add"
            ? `Start on ${spec.start} and hop forward ${spec.hops}!`
            : `Start on ${spec.start} and hop back ${spec.hops}!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: counter.emoji,
      },
      hint: {
        text: `Count ${spec.hops} hops ${spec.op === "add" ? "forward" : "backwards"} from ${spec.start}.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Super hopping! ${spec.start} ${spec.op === "add" ? "+" : "−"} ${spec.hops} = ${target}!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Almost there! Count each hop carefully from ${spec.start}.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildShapeSortBatch(
  skillId: MicroSkillId,
  prefix: string,
  pool: ReadonlyArray<
    "circle" | "square" | "triangle" | "rectangle" | "cube" | "sphere" | "cylinder" | "cone"
  >,
  stories: ReadonlyArray<{
    target:
      | "circle"
      | "square"
      | "triangle"
      | "rectangle"
      | "cube"
      | "sphere"
      | "cylinder"
      | "cone";
    context: string;
  }>
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  return stories.map((story, idx) => {
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const shift = idx % pool.length;
    const rotated = [...pool.slice(shift), ...pool.slice(0, shift)];

    return {
      id,
      type: "shape-sort",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "numeracy",
      theme,
      difficulty,
      targetShape: story.target,
      options: rotated.map((shape) => ({
        id: `shape-${shape}`,
        label: shape,
        displayText: shape,
        audioKey: `shape/${shape}`,
      })),
      correctOptionId: `shape-${story.target}`,
      prompt: {
        text: `${story.context} Sort the ${story.target} into the bucket!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: "🔷",
      },
      hint: {
        text: `Look closely at the sides and corners to spot the ${story.target}.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Brilliant shape spotting! That is a ${story.target}!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Good try! Check the shape name and have another look.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

function buildCoinBatch(
  skillId: MicroSkillId,
  prefix: string,
  specs: ReadonlyArray<{
    targetPence: number;
    coinsShown: readonly UkCoin[];
    itemName: string;
  }>
): Exercise[] {
  const skill = getMicroSkillById(skillId);
  const maxChoice = skill.yearGroup === "P1" ? 5 : 20;

  return specs.map((spec, idx) => {
    const id = `${prefix}-${String(idx + 1).padStart(2, "0")}`;
    const theme = themeAt(idx);
    const difficulty = tierAt(idx);
    const choices = new Set<number>([spec.targetPence]);
    for (const delta of [-2, -1, 1, 2, 3, -3, 5]) {
      if (choices.size >= 4) break;
      const v = spec.targetPence + delta;
      if (v >= 1 && v <= maxChoice) choices.add(v);
    }
    const sorted = Array.from(choices).sort((a, b) => a - b);

    return {
      id,
      type: "uk-coin-match",
      skillId,
      yearGroup: skill.yearGroup,
      subject: "numeracy",
      theme,
      difficulty,
      targetPence: spec.targetPence,
      coinsShown: [...spec.coinsShown],
      options: sorted.map((p) => ({
        id: `coin-${p}p`,
        label: `${p}p`,
        displayText: `${p}p`,
        audioKey: `coin/${p}p`,
      })),
      correctOptionId: `coin-${spec.targetPence}p`,
      prompt: {
        text: `Drop UK coins into the jar to pay ${spec.targetPence}p for the ${spec.itemName}!`,
        audioKey: `prompt/${id}`,
        visualCueEmoji: "🪙",
      },
      hint: {
        text: `Try combining coins like ${spec.coinsShown.join(" + ")} to make ${spec.targetPence}p.`,
        audioKey: `hint/${id}`,
      },
      feedback: {
        correctText: `Lovely! You made ${spec.targetPence}p with UK coins!`,
        correctAudioKey: `feedback/correct-${id}`,
        encourageText: `Check the total in your coin jar — we need ${spec.targetPence}p.`,
        encourageAudioKey: `feedback/encourage-${id}`,
      },
      offlineParentTip: skill.offlineParentTip,
    };
  });
}

// ============================================================================
// PRIMARY 1 MASTERY EXPANSION (11 skills × 10 = 110 exercises)
// ============================================================================
const p1Exercises: Exercise[] = [
  // 1. P1.LIT.1 — Initial Sounds: s, a, t, p, i, n
  ...buildInitialSoundBatch("ccea-p1-lit-initial-satpin", "p1m-satpin", [
    { sound: "s", word: "star", emoji: "⭐", distractors: [{ word: "ant", emoji: "🐜", sound: "a" }, { word: "tap", emoji: "🚰", sound: "t" }, { word: "net", emoji: "🥅", sound: "n" }] },
    { sound: "a", word: "astronaut", emoji: "👩‍🚀", distractors: [{ word: "sun", emoji: "☀️", sound: "s" }, { word: "pig", emoji: "🐷", sound: "p" }, { word: "tin", emoji: "🥫", sound: "t" }] },
    { sound: "t", word: "tractor", emoji: "🚜", distractors: [{ word: "snake", emoji: "🐍", sound: "s" }, { word: "apple", emoji: "🍎", sound: "a" }, { word: "nest", emoji: "🪺", sound: "n" }] },
    { sound: "p", word: "puffin", emoji: "🐧", distractors: [{ word: "tiger", emoji: "🐯", sound: "t" }, { word: "igloo", emoji: "🧊", sound: "i" }, { word: "star", emoji: "⭐", sound: "s" }] },
    { sound: "i", word: "igloo", emoji: "🧊", distractors: [{ word: "pan", emoji: "🍳", sound: "p" }, { word: "net", emoji: "🥅", sound: "n" }, { word: "apple", emoji: "🍎", sound: "a" }] },
    { sound: "n", word: "nest", emoji: "🪺", distractors: [{ word: "sun", emoji: "☀️", sound: "s" }, { word: "pig", emoji: "🐷", sound: "p" }, { word: "igloo", emoji: "🧊", sound: "i" }] },
    { sound: "s", word: "snail", emoji: "🐌", distractors: [{ word: "tiger", emoji: "🐯", sound: "t" }, { word: "ant", emoji: "🐜", sound: "a" }, { word: "pan", emoji: "🍳", sound: "p" }] },
    { sound: "p", word: "planet", emoji: "🪐", distractors: [{ word: "nest", emoji: "🪺", sound: "n" }, { word: "tractor", emoji: "🚜", sound: "t" }, { word: "igloo", emoji: "🧊", sound: "i" }] },
    { sound: "t", word: "turtle", emoji: "🐢", distractors: [{ word: "puffin", emoji: "🐧", sound: "p" }, { word: "sun", emoji: "☀️", sound: "s" }, { word: "apple", emoji: "🍎", sound: "a" }] },
    { sound: "n", word: "nut", emoji: "🌰", distractors: [{ word: "star", emoji: "⭐", sound: "s" }, { word: "tin", emoji: "🥫", sound: "t" }, { word: "pig", emoji: "🐷", sound: "p" }] },
  ]),

  // 2. P1.LIT.2 — CVC Blending (strictly s, a, t, p, i, n)
  ...buildBlendingBatch("ccea-p1-lit-cvc-blend-satpin", "p1m-blend", [
    { word: "sat", phonemes: ["s", "a", "t"], emoji: "🪑", distractors: [{ word: "pin", emoji: "📌" }, { word: "tap", emoji: "🚰" }] },
    { word: "pin", phonemes: ["p", "i", "n"], emoji: "📌", distractors: [{ word: "pan", emoji: "🍳" }, { word: "tin", emoji: "🥫" }] },
    { word: "tap", phonemes: ["t", "a", "p"], emoji: "🚰", distractors: [{ word: "nap", emoji: "😴" }, { word: "sat", emoji: "🪑" }] },
    { word: "pan", phonemes: ["p", "a", "n"], emoji: "🍳", distractors: [{ word: "pit", emoji: "🕳️" }, { word: "pin", emoji: "📌" }] },
    { word: "tin", phonemes: ["t", "i", "n"], emoji: "🥫", distractors: [{ word: "tap", emoji: "🚰" }, { word: "sip", emoji: "🥤" }] },
    { word: "pit", phonemes: ["p", "i", "t"], emoji: "🕳️", distractors: [{ word: "pat", emoji: "🐾" }, { word: "pan", emoji: "🍳" }] },
    { word: "nap", phonemes: ["n", "a", "p"], emoji: "😴", distractors: [{ word: "sat", emoji: "🪑" }, { word: "tin", emoji: "🥫" }] },
    { word: "sip", phonemes: ["s", "i", "p"], emoji: "🥤", distractors: [{ word: "pin", emoji: "📌" }, { word: "pat", emoji: "🐾" }] },
    { word: "pat", phonemes: ["p", "a", "t"], emoji: "🐾", distractors: [{ word: "tap", emoji: "🚰" }, { word: "nap", emoji: "😴" }] },
    { word: "ant", phonemes: ["a", "n", "t"], emoji: "🐜", distractors: [{ word: "sat", emoji: "🪑" }, { word: "sip", emoji: "🥤" }] },
  ]),

  // 3. P1.LIT.3 — Initial Sounds: c, k, e, h, r, m, d
  ...buildInitialSoundBatch("ccea-p1-lit-initial-ckehrmd", "p1m-ckehrmd", [
    { sound: "c", word: "comet", emoji: "☄️", distractors: [{ word: "egg", emoji: "🥚", sound: "e" }, { word: "rocket", emoji: "🚀", sound: "r" }, { word: "moon", emoji: "🌙", sound: "m" }] },
    { sound: "k", word: "kite", emoji: "🪁", distractors: [{ word: "dino", emoji: "🦕", sound: "d" }, { word: "hat", emoji: "🎩", sound: "h" }, { word: "mug", emoji: "☕", sound: "m" }] },
    { sound: "e", word: "egg", emoji: "🥚", distractors: [{ word: "crab", emoji: "🦀", sound: "c" }, { word: "rocket", emoji: "🚀", sound: "r" }, { word: "dog", emoji: "🐶", sound: "d" }] },
    { sound: "h", word: "helicopter", emoji: "🚁", distractors: [{ word: "moon", emoji: "🌙", sound: "m" }, { word: "kite", emoji: "🪁", sound: "k" }, { word: "egg", emoji: "🥚", sound: "e" }] },
    { sound: "r", word: "rocket", emoji: "🚀", distractors: [{ word: "cat", emoji: "🐱", sound: "c" }, { word: "dino", emoji: "🦕", sound: "d" }, { word: "hen", emoji: "🐔", sound: "h" }] },
    { sound: "m", word: "moon", emoji: "🌙", distractors: [{ word: "rhino", emoji: "🦏", sound: "r" }, { word: "egg", emoji: "🥚", sound: "e" }, { word: "car", emoji: "🚗", sound: "c" }] },
    { sound: "d", word: "dinosaur", emoji: "🦕", distractors: [{ word: "monkey", emoji: "🐵", sound: "m" }, { word: "kite", emoji: "🪁", sound: "k" }, { word: "hat", emoji: "🎩", sound: "h" }] },
    { sound: "c", word: "car", emoji: "🚗", distractors: [{ word: "duck", emoji: "🦆", sound: "d" }, { word: "rocket", emoji: "🚀", sound: "r" }, { word: "hen", emoji: "🐔", sound: "h" }] },
    { sound: "r", word: "rhino", emoji: "🦏", distractors: [{ word: "moon", emoji: "🌙", sound: "m" }, { word: "crab", emoji: "🦀", sound: "c" }, { word: "egg", emoji: "🥚", sound: "e" }] },
    { sound: "m", word: "monkey", emoji: "🐵", distractors: [{ word: "dino", emoji: "🦕", sound: "d" }, { word: "helicopter", emoji: "🚁", sound: "h" }, { word: "kite", emoji: "🪁", sound: "k" }] },
  ]),

  // 4. P1.LIT.4 — CVC Segmenting with Elkonin Sound Boxes (Stage 1)
  ...buildSegmentBatch("ccea-p1-lit-cvc-segment-stage1", "p1m-seg", [
    { word: "cat", graphemes: ["c", "a", "t"], emoji: "🐱", extras: ["s", "p"] },
    { word: "hat", graphemes: ["h", "a", "t"], emoji: "🎩", extras: ["m", "n"] },
    { word: "mat", graphemes: ["m", "a", "t"], emoji: "🧶", extras: ["c", "i"] },
    { word: "rat", graphemes: ["r", "a", "t"], emoji: "🐀", extras: ["p", "e"] },
    { word: "map", graphemes: ["m", "a", "p"], emoji: "🗺️", extras: ["t", "d"] },
    { word: "cap", graphemes: ["c", "a", "p"], emoji: "🧢", extras: ["h", "n"] },
    { word: "red", graphemes: ["r", "e", "d"], emoji: "🔴", extras: ["s", "m"] },
    { word: "hen", graphemes: ["h", "e", "n"], emoji: "🐔", extras: ["t", "a"] },
    { word: "pen", graphemes: ["p", "e", "n"], emoji: "🖊️", extras: ["c", "d"] },
    { word: "net", graphemes: ["n", "e", "t"], emoji: "🥅", extras: ["r", "i"] },
  ]),

  // 5. P1.LIT.5 — Initial Sounds: g, o, u, l, f, b & Remaining Stage 1
  ...buildInitialSoundBatch("ccea-p1-lit-initial-goulfb", "p1m-goulfb", [
    { sound: "g", word: "galaxy", emoji: "🌌", distractors: [{ word: "fox", emoji: "🦊", sound: "f" }, { word: "bus", emoji: "🚌", sound: "b" }, { word: "octopus", emoji: "🐙", sound: "o" }] },
    { sound: "o", word: "octopus", emoji: "🐙", distractors: [{ word: "lorry", emoji: "🚛", sound: "l" }, { word: "van", emoji: "🚐", sound: "v" }, { word: "goat", emoji: "🐐", sound: "g" }] },
    { sound: "u", word: "umbrella", emoji: "☂️", distractors: [{ word: "whale", emoji: "🐋", sound: "w" }, { word: "fox", emoji: "🦊", sound: "f" }, { word: "bus", emoji: "🚌", sound: "b" }] },
    { sound: "l", word: "lorry", emoji: "🚛", distractors: [{ word: "zebra", emoji: "🦓", sound: "z" }, { word: "jet", emoji: "✈️", sound: "j" }, { word: "octopus", emoji: "🐙", sound: "o" }] },
    { sound: "f", word: "fox", emoji: "🦊", distractors: [{ word: "bus", emoji: "🚌", sound: "b" }, { word: "galaxy", emoji: "🌌", sound: "g" }, { word: "umbrella", emoji: "☂️", sound: "u" }] },
    { sound: "b", word: "bus", emoji: "🚌", distractors: [{ word: "van", emoji: "🚐", sound: "v" }, { word: "lion", emoji: "🦁", sound: "l" }, { word: "fox", emoji: "🦊", sound: "f" }] },
    { sound: "v", word: "van", emoji: "🚐", distractors: [{ word: "whale", emoji: "🐋", sound: "w" }, { word: "goat", emoji: "🐐", sound: "g" }, { word: "bus", emoji: "🚌", sound: "b" }] },
    { sound: "w", word: "whale", emoji: "🐋", distractors: [{ word: "zebra", emoji: "🦓", sound: "z" }, { word: "lorry", emoji: "🚛", sound: "l" }, { word: "van", emoji: "🚐", sound: "v" }] },
    { sound: "z", word: "zebra", emoji: "🦓", distractors: [{ word: "jet", emoji: "✈️", sound: "j" }, { word: "fox", emoji: "🦊", sound: "f" }, { word: "octopus", emoji: "🐙", sound: "o" }] },
    { sound: "j", word: "jet", emoji: "✈️", distractors: [{ word: "umbrella", emoji: "☂️", sound: "u" }, { word: "whale", emoji: "🐋", sound: "w" }, { word: "bus", emoji: "🚌", sound: "b" }] },
  ]),

  // 6. P1.LIT.6 — P1 High-Frequency Words
  ...buildHfwOrCaptionBatch("ccea-p1-lit-hfw-p1", "p1m-hfw", [
    { targetWord: "the", sentence: "Look at ___ big rocket.", emoji: "🚀", distractors: ["and", "is", "to"] },
    { targetWord: "and", sentence: "A fox ___ a puffin play.", emoji: "🦊", distractors: ["the", "in", "it"] },
    { targetWord: "is", sentence: "That dino ___ very tall.", emoji: "🦕", distractors: ["to", "on", "we"] },
    { targetWord: "in", sentence: "The pup sits ___ the van.", emoji: "🚐", distractors: ["at", "the", "can"] },
    { targetWord: "it", sentence: "Look at the star, ___ shines!", emoji: "⭐", distractors: ["is", "in", "to"] },
    { targetWord: "to", sentence: "Let us zoom ___ the moon.", emoji: "🌙", distractors: ["and", "on", "at"] },
    { targetWord: "on", sentence: "A frog hops ___ the bus.", emoji: "🚌", distractors: ["in", "is", "we"] },
    { targetWord: "at", sentence: "Wave ___ the cheeky fox!", emoji: "🦊", distractors: ["to", "it", "the"] },
    { targetWord: "can", sentence: "A big dino ___ stomp fast.", emoji: "🦖", distractors: ["and", "on", "is"] },
    { targetWord: "we", sentence: "___ love going to space!", emoji: "👩‍🚀", distractors: ["to", "at", "in"] },
  ]),

  // 7. P1.NUM.1 — Subitising & Counting 1–5
  ...buildTenFrameBatch("ccea-p1-num-subitise-1-5", "p1m-sub", 10, [
    { mode: "count-to-numeral", target: 1, initial: 1 },
    { mode: "count-to-numeral", target: 2, initial: 2 },
    { mode: "count-to-numeral", target: 3, initial: 3 },
    { mode: "count-to-numeral", target: 4, initial: 4 },
    { mode: "count-to-numeral", target: 5, initial: 5 },
    { mode: "build-on-frame", target: 2, initial: 0 },
    { mode: "build-on-frame", target: 3, initial: 1 },
    { mode: "build-on-frame", target: 4, initial: 1 },
    { mode: "build-on-frame", target: 5, initial: 2 },
    { mode: "build-on-frame", target: 5, initial: 0 },
  ]),

  // 8. P1.NUM.2 — Ten-Frames 1–10
  ...buildTenFrameBatch("ccea-p1-num-ten-frames-1-10", "p1m-tf10", 10, [
    { mode: "count-to-numeral", target: 6, initial: 6 },
    { mode: "count-to-numeral", target: 7, initial: 7 },
    { mode: "count-to-numeral", target: 8, initial: 8 },
    { mode: "count-to-numeral", target: 9, initial: 9 },
    { mode: "count-to-numeral", target: 10, initial: 10 },
    { mode: "build-on-frame", target: 6, initial: 3 },
    { mode: "build-on-frame", target: 7, initial: 5 },
    { mode: "build-on-frame", target: 8, initial: 5 },
    { mode: "build-on-frame", target: 9, initial: 5 },
    { mode: "build-on-frame", target: 10, initial: 6 },
  ]),

  // 9. P1.NUM.3 — Number Bonds to 5
  ...buildNumberBondBatch("ccea-p1-num-bonds-to-5", "p1m-b5", [
    { whole: 5, givenPart: 1 },
    { whole: 5, givenPart: 2 },
    { whole: 5, givenPart: 3 },
    { whole: 5, givenPart: 4 },
    { whole: 5, givenPart: 0 },
    { whole: 5, givenPart: 5 },
  ]),
  ...buildNumberLineBatch(
    "ccea-p1-num-bonds-to-5",
    "p1m-b5",
    10,
    [
      { start: 2, op: "add", hops: 3 },
      { start: 1, op: "add", hops: 4 },
      { start: 5, op: "subtract", hops: 2 },
      { start: 5, op: "subtract", hops: 3 },
    ],
    6
  ),

  // 10. P1.NUM.4 — Recognising 2D Shapes
  ...buildShapeSortBatch(
    "ccea-p1-num-shapes-2d",
    "p1m-2d",
    ["circle", "square", "triangle", "rectangle"],
    [
      { target: "circle", context: "The moon window is round!" },
      { target: "square", context: "This dino tile has 4 equal sides!" },
      { target: "triangle", context: "A puffin flag has 3 corners!" },
      { target: "rectangle", context: "The bus door is long and straight!" },
      { target: "circle", context: "Spot the round tractor wheel!" },
      { target: "square", context: "Find the square space hatch!" },
      { target: "triangle", context: "Spot the 3-sided volcano peak!" },
      { target: "rectangle", context: "Find the long train ticket!" },
      { target: "circle", context: "Find the round planet ring!" },
      { target: "triangle", context: "Find the triangle rocket nose!" },
    ]
  ),

  // 11. P1.NUM.5 — Recognising UK Coins (1p, 2p, 5p)
  ...buildCoinBatch("ccea-p1-num-coins-1p-5p", "p1m-c5", [
    { targetPence: 1, coinsShown: ["1p"], itemName: "star sticker" },
    { targetPence: 2, coinsShown: ["2p"], itemName: "dino badge" },
    { targetPence: 2, coinsShown: ["1p", "1p"], itemName: "puffin postcard" },
    { targetPence: 3, coinsShown: ["2p", "1p"], itemName: "toy bus ticket" },
    { targetPence: 3, coinsShown: ["1p", "1p", "1p"], itemName: "moon rock" },
    { targetPence: 4, coinsShown: ["2p", "2p"], itemName: "fossil brush" },
    { targetPence: 4, coinsShown: ["2p", "1p", "1p"], itemName: "fox pencil" },
    { targetPence: 5, coinsShown: ["5p"], itemName: "rocket key" },
    { targetPence: 5, coinsShown: ["2p", "2p", "1p"], itemName: "digger hat" },
    { targetPence: 5, coinsShown: ["2p", "1p", "1p", "1p"], itemName: "star map" },
  ]),
];

// ============================================================================
// PRIMARY 2 MASTERY EXPANSION (10 skills × 10 = 100 exercises)
// ============================================================================
const p2Exercises: Exercise[] = [
  // 1. P2.LIT.1 — Adjacent Consonants: CVCC & CCVC Blending/Segmenting
  ...buildBlendingBatch("ccea-p2-lit-cvcc-ccvc", "p2m-ccvc", [
    { word: "frog", phonemes: ["f", "r", "o", "g"], emoji: "🐸", distractors: [{ word: "crab", emoji: "🦀" }, { word: "drum", emoji: "🥁" }] },
    { word: "stop", phonemes: ["s", "t", "o", "p"], emoji: "🛑", distractors: [{ word: "tent", emoji: "⛺" }, { word: "lamp", emoji: "💡" }] },
    { word: "tent", phonemes: ["t", "e", "n", "t"], emoji: "⛺", distractors: [{ word: "nest", emoji: "🪺" }, { word: "desk", emoji: "🪑" }] },
    { word: "lamp", phonemes: ["l", "a", "m", "p"], emoji: "💡", distractors: [{ word: "hand", emoji: "✋" }, { word: "milk", emoji: "🥛" }] },
    { word: "drum", phonemes: ["d", "r", "u", "m"], emoji: "🥁", distractors: [{ word: "frog", emoji: "🐸" }, { word: "stop", emoji: "🛑" }] },
  ]),
  ...buildSegmentBatch(
    "ccea-p2-lit-cvcc-ccvc",
    "p2m-ccvc",
    [
      { word: "crab", graphemes: ["c", "r", "a", "b"], emoji: "🦀", extras: ["s", "p"] },
      { word: "nest", graphemes: ["n", "e", "s", "t"], emoji: "🪺", extras: ["m", "p"] },
      { word: "hand", graphemes: ["h", "a", "n", "d"], emoji: "✋", extras: ["t", "l"] },
      { word: "milk", graphemes: ["m", "i", "l", "k"], emoji: "🥛", extras: ["s", "t"] },
      { word: "desk", graphemes: ["d", "e", "s", "k"], emoji: "🪑", extras: ["r", "n"] },
    ],
    5
  ),

  // 2. P2.LIT.2 — Consonant Digraphs: sh, ch, th, ng
  ...buildBlendingBatch("ccea-p2-lit-digraphs-sh-ch-th-ng", "p2m-dig", [
    { word: "ship", phonemes: ["sh", "i", "p"], emoji: "🚢", distractors: [{ word: "shop", emoji: "🏪" }, { word: "fish", emoji: "🐟" }] },
    { word: "fish", phonemes: ["f", "i", "sh"], emoji: "🐟", distractors: [{ word: "moth", emoji: "🦋" }, { word: "ring", emoji: "💍" }] },
    { word: "chip", phonemes: ["ch", "i", "p"], emoji: "🍟", distractors: [{ word: "chin", emoji: "😊" }, { word: "ship", emoji: "🚢" }] },
    { word: "moth", phonemes: ["m", "o", "th"], emoji: "🦋", distractors: [{ word: "path", emoji: "🛤️" }, { word: "king", emoji: "👑" }] },
    { word: "ring", phonemes: ["r", "i", "ng"], emoji: "💍", distractors: [{ word: "wing", emoji: "🪶" }, { word: "fish", emoji: "🐟" }] },
  ]),
  ...buildSegmentBatch(
    "ccea-p2-lit-digraphs-sh-ch-th-ng",
    "p2m-dig",
    [
      { word: "shop", graphemes: ["sh", "o", "p"], emoji: "🏪", extras: ["ch", "t"] },
      { word: "chin", graphemes: ["ch", "i", "n"], emoji: "😊", extras: ["sh", "p"] },
      { word: "chat", graphemes: ["ch", "a", "t"], emoji: "💬", extras: ["th", "m"] },
      { word: "path", graphemes: ["p", "a", "th"], emoji: "🛤️", extras: ["sh", "n"] },
      { word: "king", graphemes: ["k", "i", "ng"], emoji: "👑", extras: ["ch", "s"] },
    ],
    5
  ),

  // 3. P2.LIT.3 — Double Letter Endings: ff, ll, ss, zz
  ...buildBlendingBatch("ccea-p2-lit-double-letters", "p2m-dbl", [
    { word: "bell", phonemes: ["b", "e", "ll"], emoji: "🔔", distractors: [{ word: "hill", emoji: "⛰️" }, { word: "doll", emoji: "🪆" }] },
    { word: "hill", phonemes: ["h", "i", "ll"], emoji: "⛰️", distractors: [{ word: "moss", emoji: "🌿" }, { word: "bell", emoji: "🔔" }] },
    { word: "puff", phonemes: ["p", "u", "ff"], emoji: "💨", distractors: [{ word: "hiss", emoji: "🐍" }, { word: "buzz", emoji: "🐝" }] },
    { word: "moss", phonemes: ["m", "o", "ss"], emoji: "🌿", distractors: [{ word: "fizz", emoji: "🫧" }, { word: "hill", emoji: "⛰️" }] },
    { word: "buzz", phonemes: ["b", "u", "zz"], emoji: "🐝", distractors: [{ word: "puff", emoji: "💨" }, { word: "bell", emoji: "🔔" }] },
  ]),
  ...buildSegmentBatch(
    "ccea-p2-lit-double-letters",
    "p2m-dbl",
    [
      { word: "doll", graphemes: ["d", "o", "ll"], emoji: "🪆", extras: ["ff", "ss"] },
      { word: "cuff", graphemes: ["c", "u", "ff"], emoji: "🧥", extras: ["ll", "zz"] },
      { word: "hiss", graphemes: ["h", "i", "ss"], emoji: "🐍", extras: ["ll", "ff"] },
      { word: "kiss", graphemes: ["k", "i", "ss"], emoji: "💛", extras: ["zz", "ll"] },
      { word: "fizz", graphemes: ["f", "i", "zz"], emoji: "🫧", extras: ["ss", "ff"] },
    ],
    5
  ),

  // 4. P2.LIT.4 — Target Vowel Representations (ee/ea, ai/ay, oa/ow)
  ...buildBlendingBatch("ccea-p2-lit-vowel-sounds", "p2m-vow", [
    { word: "tree", phonemes: ["t", "r", "ee"], emoji: "🌳", distractors: [{ word: "leaf", emoji: "🍃" }, { word: "boat", emoji: "⛵" }] },
    { word: "leaf", phonemes: ["l", "ea", "f"], emoji: "🍃", distractors: [{ word: "rain", emoji: "🌧️" }, { word: "goat", emoji: "🐐" }] },
    { word: "rain", phonemes: ["r", "ai", "n"], emoji: "🌧️", distractors: [{ word: "tail", emoji: "🦊" }, { word: "tree", emoji: "🌳" }] },
    { word: "boat", phonemes: ["b", "oa", "t"], emoji: "⛵", distractors: [{ word: "snow", emoji: "❄️" }, { word: "play", emoji: "🎈" }] },
    { word: "snow", phonemes: ["s", "n", "ow"], emoji: "❄️", distractors: [{ word: "boat", emoji: "⛵" }, { word: "rain", emoji: "🌧️" }] },
  ]),
  ...buildSegmentBatch(
    "ccea-p2-lit-vowel-sounds",
    "p2m-vow",
    [
      { word: "feet", graphemes: ["f", "ee", "t"], emoji: "🦶", extras: ["ai", "oa"] },
      { word: "bean", graphemes: ["b", "ea", "n"], emoji: "🫘", extras: ["ee", "ow"] },
      { word: "tail", graphemes: ["t", "ai", "l"], emoji: "🦊", extras: ["ay", "oa"] },
      { word: "play", graphemes: ["p", "l", "ay"], emoji: "🎈", extras: ["ai", "ee"] },
      { word: "goat", graphemes: ["g", "oa", "t"], emoji: "🐐", extras: ["ow", "ea"] },
    ],
    5
  ),

  // 5. P2.LIT.5 — Simple Sentences & Picture Comprehension
  ...buildHfwOrCaptionBatch("ccea-p2-lit-captions-comprehension", "p2m-cap", [
    { targetWord: "moon", sentence: "The silver rocket landed on the ___.", emoji: "🌙", distractors: ["mud", "tent", "milk"] },
    { targetWord: "egg", sentence: "A tiny baby dino hatched from an ___.", emoji: "🥚", distractors: ["bus", "hat", "bell"] },
    { targetWord: "fish", sentence: "The puffin dived down to catch a ___.", emoji: "🐟", distractors: ["desk", "ring", "snow"] },
    { targetWord: "hill", sentence: "The red tractor chugged up the green ___.", emoji: "🚜", distractors: ["soup", "chin", "lamp"] },
    { targetWord: "boat", sentence: "We sailed across Belfast Lough in a ___.", emoji: "⛵", distractors: ["crab", "tree", "goat"] },
    { targetWord: "nest", sentence: "Three speckled eggs sat safely in a ___.", emoji: "🪺", distractors: ["shop", "drum", "tail"] },
    { targetWord: "rain", sentence: "Put your yellow coat on in the ___.", emoji: "🌧️", distractors: ["frog", "star", "king"] },
    { targetWord: "tent", sentence: "We slept under the stars inside a ___.", emoji: "⛺", distractors: ["fish", "chip", "bell"] },
    { targetWord: "bell", sentence: "Ding dong went the shiny brass ___.", emoji: "🔔", distractors: ["leaf", "moth", "van"] },
    { targetWord: "snow", sentence: "Sparky left paw prints in the white ___.", emoji: "❄️", distractors: ["hand", "path", "pan"] },
  ]),

  // 6. P2.NUM.1 — Double Ten-Frames & Place Value (11–20)
  ...buildTenFrameBatch("ccea-p2-num-ten-frames-11-20", "p2m-tf20", 20, [
    { mode: "count-to-numeral", target: 11, initial: 11 },
    { mode: "count-to-numeral", target: 13, initial: 13 },
    { mode: "count-to-numeral", target: 15, initial: 15 },
    { mode: "count-to-numeral", target: 17, initial: 17 },
    { mode: "count-to-numeral", target: 19, initial: 19 },
    { mode: "build-on-frame", target: 12, initial: 10 },
    { mode: "build-on-frame", target: 14, initial: 10 },
    { mode: "build-on-frame", target: 16, initial: 10 },
    { mode: "build-on-frame", target: 18, initial: 10 },
    { mode: "build-on-frame", target: 20, initial: 10 },
  ]),

  // 7. P2.NUM.2 — Number Bonds to 10
  ...buildNumberBondBatch("ccea-p2-num-bonds-to-10", "p2m-b10", [
    { whole: 10, givenPart: 1 },
    { whole: 10, givenPart: 2 },
    { whole: 10, givenPart: 3 },
    { whole: 10, givenPart: 4 },
    { whole: 10, givenPart: 5 },
    { whole: 10, givenPart: 6 },
    { whole: 10, givenPart: 7 },
    { whole: 10, givenPart: 8 },
  ]),
  ...buildNumberLineBatch(
    "ccea-p2-num-bonds-to-10",
    "p2m-b10",
    10,
    [
      { start: 9, op: "add", hops: 1 },
      { start: 4, op: "add", hops: 6 },
    ],
    8
  ),

  // 8. P2.NUM.3 — Practical Addition & Subtraction within 20
  ...buildNumberLineBatch("ccea-p2-num-add-sub-within-20", "p2m-as20", 20, [
    { start: 8, op: "add", hops: 5 },
    { start: 11, op: "add", hops: 6 },
    { start: 12, op: "add", hops: 7 },
    { start: 15, op: "subtract", hops: 4 },
    { start: 18, op: "subtract", hops: 6 },
    { start: 20, op: "subtract", hops: 5 },
  ]),
  ...buildNumberBondBatch(
    "ccea-p2-num-add-sub-within-20",
    "p2m-as20",
    [
      { whole: 14, givenPart: 9 },
      { whole: 16, givenPart: 10 },
      { whole: 18, givenPart: 12 },
      { whole: 20, givenPart: 13 },
    ],
    6
  ),

  // 9. P2.NUM.4 — Counting & Combining UK Coins (1p–20p)
  ...buildCoinBatch("ccea-p2-num-coins-to-20p", "p2m-c20", [
    { targetPence: 6, coinsShown: ["5p", "1p"], itemName: "space sticker" },
    { targetPence: 7, coinsShown: ["5p", "2p"], itemName: "dino ruler" },
    { targetPence: 8, coinsShown: ["5p", "2p", "1p"], itemName: "puffin rubber" },
    { targetPence: 10, coinsShown: ["5p", "5p"], itemName: "bus pass" },
    { targetPence: 11, coinsShown: ["10p", "1p"], itemName: "comet badge" },
    { targetPence: 12, coinsShown: ["10p", "2p"], itemName: "fossil kit" },
    { targetPence: 14, coinsShown: ["10p", "2p", "2p"], itemName: "fox notebook" },
    { targetPence: 15, coinsShown: ["10p", "5p"], itemName: "train whistle" },
    { targetPence: 17, coinsShown: ["10p", "5p", "2p"], itemName: "planet poster" },
    { targetPence: 20, coinsShown: ["10p", "10p"], itemName: "golden telescope" },
  ]),

  // 10. P2.NUM.5 — Recognising 3D Shapes in Everyday Objects
  ...buildShapeSortBatch(
    "ccea-p2-num-shapes-3d",
    "p2m-3d",
    ["cube", "sphere", "cylinder", "cone"],
    [
      { target: "cube", context: "This space cargo box has 6 flat square faces!" },
      { target: "sphere", context: "A bouncy planet rolls in every direction!" },
      { target: "cylinder", context: "A baked-bean tin can roll and stack!" },
      { target: "cone", context: "Look at the pointy road traffic cone!" },
      { target: "cube", context: "Spot the 3D dice block!" },
      { target: "sphere", context: "Find the round football shape!" },
      { target: "cylinder", context: "Find the rocket fuel drum!" },
      { target: "cone", context: "Spot the pointy birthday party hat!" },
      { target: "cube", context: "Find the wooden building block!" },
      { target: "cylinder", context: "Spot the rolling log bridge!" },
    ]
  ),
];

const p1SkillIds = Array.from(new Set(p1Exercises.map((e) => e.skillId)));
const p2SkillIds = Array.from(new Set(p2Exercises.map((e) => e.skillId)));

const p1Pack = ContentPackSchema.parse({
  packId: "ccea-p1-mastery-expansion",
  version: "1.0.0",
  title: "P1 Mastery Expansion: Complete 11-Skill Foundation Stage Pool",
  description:
    "110 themed Primary 1 exercises (10 per CCEA Foundation Stage skill) spanning Linguistic Phonics Stage 1, sight words, subitising, Ten-Frames 1–10, bonds to 5, 2D shapes, and UK coins 1p–5p.",
  yearGroup: "P1",
  locale: "en-GB-NI",
  skillIds: p1SkillIds,
  exercises: p1Exercises,
});

const p2Pack = ContentPackSchema.parse({
  packId: "ccea-p2-mastery-expansion",
  version: "1.0.0",
  title: "P2 Mastery Expansion: Complete 10-Skill Foundation Stage Pool",
  description:
    "100 themed Primary 2 exercises (10 per CCEA Foundation Stage skill) spanning CCVC/CVCC, digraphs, double letters, target vowels, decodable captions, Double Ten-Frames 11–20, bonds to 10, +/- within 20, UK coins to 20p, and 3D shapes.",
  yearGroup: "P2",
  locale: "en-GB-NI",
  skillIds: p2SkillIds,
  exercises: p2Exercises,
});

fs.writeFileSync(
  path.join(PACKS_DIR, "p1-mastery-expansion.json"),
  `${JSON.stringify(p1Pack, null, 2)}\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(PACKS_DIR, "p2-mastery-expansion.json"),
  `${JSON.stringify(p2Pack, null, 2)}\n`,
  "utf8"
);

console.log(
  `✓ Wrote p1-mastery-expansion.json (${p1Pack.exercises.length} exercises across ${p1Pack.skillIds.length} P1 skills)`
);
console.log(
  `✓ Wrote p2-mastery-expansion.json (${p2Pack.exercises.length} exercises across ${p2Pack.skillIds.length} P2 skills)`
);
