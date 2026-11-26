import type {
  ContentPack,
  Exercise,
  MicroSkillId,
  Theme,
  YearGroup,
} from "@wee-sparks/curriculum-schema";
import { P1_CORE_EXPANSION_EXERCISES } from "./fixturesP1Core";
import { P2_FOUNDATION_EXERCISES } from "./fixturesP2";

/**
 * Curated offline NI CCEA P1 expansion fixture bank (16 exercises):
 * 4 per theme (space, dinosaurs, animals, vehicles) covering:
 * - Linguistic Phonics Stage 1 initial sounds (s, a, t, p, i, n)
 * - CVC blending strictly from {s, a, t, p, i, n}
 * - P1 High-Frequency Words (the, in, and, to)
 * - Ten-Frames 1–10 (count-to-numeral & build-on-frame)
 */
const P1_FIXTURE_EXERCISES: readonly Exercise[] = [
  // =========================================================================
  // STAGE 1 INITIAL SOUNDS (s, a, t, p, i, n) — 4 themed exercises
  // =========================================================================
  {
    id: "p1-exp-init-01",
    type: "initial-sound-match",
    mode: "sound-to-picture",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "developing",
    targetSound: "s",
    targetSoundAudioKey: "phoneme/s",
    stimulus: {
      label: "satellite",
      emoji: "🛰️",
      audioKey: "word/satellite",
    },
    prompt: {
      text: "Tap the space picture that starts with the /s/ sound.",
      audioKey: "prompt/p1-exp-init-01",
      visualCueEmoji: "🛰️",
    },
    hint: {
      text: "Stretch the first sound: sss-atellite starts with /s/!",
      audioKey: "hint/p1-exp-init-01",
    },
    feedback: {
      correctText: "Super space spotting! Satellite starts with /s/!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Good try! Listen carefully to the very first sound.",
      encourageAudioKey: "feedback/try-again-04",
    },
    offlineParentTip:
      "Make a space-themed sound basket: name real or pretend space things and cheer whenever a word starts with a pure 'ssss' sound.",
    options: [
      { id: "opt-moon", label: "moon", emoji: "🌙", audioKey: "word/moon" },
      {
        id: "opt-satellite",
        label: "satellite",
        emoji: "🛰️",
        audioKey: "word/satellite",
      },
      { id: "opt-rocket", label: "rocket", emoji: "🚀", audioKey: "word/rocket" },
      { id: "opt-comet", label: "comet", emoji: "☄️", audioKey: "word/comet" },
    ],
    correctOptionId: "opt-satellite",
  },
  {
    id: "p1-exp-init-02",
    type: "initial-sound-match",
    mode: "picture-to-grapheme",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetSound: "t",
    targetSoundAudioKey: "phoneme/t",
    stimulus: {
      label: "tail",
      emoji: "🦕",
      audioKey: "word/tail",
    },
    prompt: {
      text: "The dinosaur has a long tail! Tap the letter for the first sound in tail.",
      audioKey: "prompt/p1-exp-init-02",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Listen for the crisp /t/ at the beginning of t-t-tail.",
      audioKey: "hint/p1-exp-init-02",
    },
    feedback: {
      correctText: "Roar-some! Tail starts with /t/!",
      correctAudioKey: "feedback/praise-03",
      encourageText: "Have another go! Say tail quietly and feel your tongue tap for /t/.",
      encourageAudioKey: "feedback/try-again-03",
    },
    offlineParentTip:
      "Play 'Dinosaur Stomp': say words aloud and let your child stomp like a dinosaur only when they hear a word starting with /t/.",
    options: [
      { id: "opt-s", label: "s", displayText: "s", audioKey: "phoneme/s" },
      { id: "opt-t", label: "t", displayText: "t", audioKey: "phoneme/t" },
      { id: "opt-a", label: "a", displayText: "a", audioKey: "phoneme/a" },
      { id: "opt-p", label: "p", displayText: "p", audioKey: "phoneme/p" },
    ],
    correctOptionId: "opt-t",
  },
  {
    id: "p1-exp-init-03",
    type: "initial-sound-match",
    mode: "picture-to-grapheme",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "secure",
    targetSound: "n",
    targetSoundAudioKey: "phoneme/n",
    stimulus: {
      label: "newt",
      emoji: "🦎",
      audioKey: "word/newt",
    },
    prompt: {
      text: "A little newt crept past the pond! Which letter starts newt?",
      audioKey: "prompt/p1-exp-init-03",
      visualCueEmoji: "🦎",
    },
    hint: {
      text: "Hold the first sound: nnnn-ewt starts with /n/!",
      audioKey: "hint/p1-exp-init-03",
    },
    feedback: {
      correctText: "Brilliant! Newt starts with /n/!",
      correctAudioKey: "feedback/praise-02",
      encourageText: "Almost! Tap the letter cards to listen to each sound.",
      encourageAudioKey: "feedback/try-again-02",
    },
    offlineParentTip:
      "On a nature walk, play 'Pond Sound Hunt'—spot things starting with /n/ (net, nest, nut) and contrast them with /p/ (pond, pebble).",
    options: [
      { id: "opt-p", label: "p", displayText: "p", audioKey: "phoneme/p" },
      { id: "opt-i", label: "i", displayText: "i", audioKey: "phoneme/i" },
      { id: "opt-n", label: "n", displayText: "n", audioKey: "phoneme/n" },
      { id: "opt-s", label: "s", displayText: "s", audioKey: "phoneme/s" },
    ],
    correctOptionId: "opt-n",
  },
  {
    id: "p1-exp-init-04",
    type: "initial-sound-match",
    mode: "sound-to-picture",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "emerging",
    targetSound: "p",
    targetSoundAudioKey: "phoneme/p",
    stimulus: {
      label: "paddle",
      emoji: "🛶",
      audioKey: "word/paddle",
    },
    prompt: {
      text: "Tap the picture that starts with the /p/ sound.",
      audioKey: "prompt/p1-exp-init-04",
      visualCueEmoji: "🛶",
    },
    hint: {
      text: "Listen for the quiet lip pop at the start of p-p-paddle!",
      audioKey: "hint/p1-exp-init-04",
    },
    feedback: {
      correctText: "Splendid! Paddle starts with /p/!",
      correctAudioKey: "feedback/praise-09",
      encourageText: "Try again! Listen to the first sound of each vehicle card.",
      encourageAudioKey: "feedback/try-again-09",
    },
    offlineParentTip:
      "While drawing boats or cars together, ask your child to label parts that start with /p/ (paddle) or /t/ (tyre) using pure letter sounds.",
    options: [
      { id: "opt-bus", label: "bus", emoji: "🚌", audioKey: "word/bus" },
      { id: "opt-van", label: "van", emoji: "🚐", audioKey: "word/van" },
      { id: "opt-paddle", label: "paddle", emoji: "🛶", audioKey: "word/paddle" },
      { id: "opt-car", label: "car", emoji: "🚗", audioKey: "word/car" },
    ],
    correctOptionId: "opt-paddle",
  },

  // =========================================================================
  // CVC BLENDING (strictly s, a, t, p, i, n) — 4 themed exercises
  // =========================================================================
  {
    id: "p1-exp-cvc-01",
    type: "cvc-blending",
    skillId: "ccea-p1-lit-cvc-blend-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    targetWord: "pan",
    wordAudioKey: "word/pan",
    phonemes: [
      { grapheme: "p", audioKey: "phoneme/p" },
      { grapheme: "a", audioKey: "phoneme/a" },
      { grapheme: "n", audioKey: "phoneme/n" },
    ],
    prompt: {
      text: "Build p-a-n in the sound boxes, blend it, and tap the picture!",
      audioKey: "prompt/p1-exp-cvc-01",
      visualCueEmoji: "🍳",
    },
    hint: {
      text: "Push the three sounds together smoothly: p-a-n ... pan!",
      audioKey: "hint/p1-exp-cvc-01",
    },
    feedback: {
      correctText: "Marvellous blending! p-a-n makes pan!",
      correctAudioKey: "feedback/praise-10",
      encourageText: "Tap each sound box from left to right and blend again.",
      encourageAudioKey: "feedback/try-again-10",
    },
    offlineParentTip:
      "Swap the middle vowel between 'pan' and 'pin' on scrap paper so your child hears how changing /a/ to /i/ makes a new word.",
    options: [
      { id: "opt-pan", label: "pan", displayText: "pan", emoji: "🍳", audioKey: "word/pan" },
      { id: "opt-tin", label: "tin", displayText: "tin", emoji: "🥫", audioKey: "word/tin" },
      { id: "opt-sat", label: "sat", displayText: "sat", emoji: "🐱", audioKey: "word/sat" },
      { id: "opt-pin", label: "pin", displayText: "pin", emoji: "📌", audioKey: "word/pin" },
    ],
    correctOptionId: "opt-pan",
  },
  {
    id: "p1-exp-cvc-02",
    type: "cvc-blending",
    skillId: "ccea-p1-lit-cvc-blend-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "developing",
    targetWord: "tin",
    wordAudioKey: "word/tin",
    phonemes: [
      { grapheme: "t", audioKey: "phoneme/t" },
      { grapheme: "i", audioKey: "phoneme/i" },
      { grapheme: "n", audioKey: "phoneme/n" },
    ],
    prompt: {
      text: "The astronaut packed space snacks! Build and blend t-i-n.",
      audioKey: "prompt/p1-exp-cvc-02",
      visualCueEmoji: "🥫",
    },
    hint: {
      text: "Say t-i-n faster together to hear tin!",
      audioKey: "hint/p1-exp-cvc-02",
    },
    feedback: {
      correctText: "Lift-off! t-i-n blends to tin!",
      correctAudioKey: "feedback/praise-01",
      encourageText: "Tap Slide & Blend to listen to all three sounds flowing together.",
      encourageAudioKey: "feedback/try-again-01",
    },
    offlineParentTip:
      "Use food cupboard tins as props: write 'tin' on a label and have your child point underneath each letter as they blend t-i-n.",
    options: [
      { id: "opt-pan", label: "pan", displayText: "pan", emoji: "🍳", audioKey: "word/pan" },
      { id: "opt-tin", label: "tin", displayText: "tin", emoji: "🥫", audioKey: "word/tin" },
      { id: "opt-tap", label: "tap", displayText: "tap", emoji: "🚰", audioKey: "word/tap" },
      { id: "opt-nap", label: "nap", displayText: "nap", emoji: "😴", audioKey: "word/nap" },
    ],
    correctOptionId: "opt-tin",
  },
  {
    id: "p1-exp-cvc-03",
    type: "cvc-blending",
    skillId: "ccea-p1-lit-cvc-blend-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetWord: "sit",
    wordAudioKey: "word/sit",
    phonemes: [
      { grapheme: "s", audioKey: "phoneme/s" },
      { grapheme: "i", audioKey: "phoneme/i" },
      { grapheme: "t", audioKey: "phoneme/t" },
    ],
    prompt: {
      text: "Help the little dinosaur take a rest! Build and blend s-i-t.",
      audioKey: "prompt/p1-exp-cvc-03",
      visualCueEmoji: "🪑",
    },
    hint: {
      text: "Stretch /s/, add /i/, finish with /t/: sit!",
      audioKey: "hint/p1-exp-cvc-03",
    },
    feedback: {
      correctText: "Dino-mite! s-i-t makes sit!",
      correctAudioKey: "feedback/praise-12",
      encourageText: "Listen to the middle /i/ sound and have another go!",
      encourageAudioKey: "feedback/try-again-12",
    },
    offlineParentTip:
      "Act out Stage 1 action words like 'sit' and 'tap' whenever your child blends them from three letter cards.",
    options: [
      { id: "opt-sat", label: "sat", displayText: "sat", emoji: "🐱", audioKey: "word/sat" },
      { id: "opt-pin", label: "pin", displayText: "pin", emoji: "📌", audioKey: "word/pin" },
      { id: "opt-sit", label: "sit", displayText: "sit", emoji: "🪑", audioKey: "word/sit" },
      { id: "opt-tap", label: "tap", displayText: "tap", emoji: "🚰", audioKey: "word/tap" },
    ],
    correctOptionId: "opt-sit",
  },
  {
    id: "p1-exp-cvc-04",
    type: "cvc-blending",
    skillId: "ccea-p1-lit-cvc-blend-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "secure",
    targetWord: "nap",
    wordAudioKey: "word/nap",
    phonemes: [
      { grapheme: "n", audioKey: "phoneme/n" },
      { grapheme: "a", audioKey: "phoneme/a" },
      { grapheme: "p", audioKey: "phoneme/p" },
    ],
    prompt: {
      text: "After a long bus journey, it is time for a n-a-p! Build and blend.",
      audioKey: "prompt/p1-exp-cvc-04",
      visualCueEmoji: "😴",
    },
    hint: {
      text: "Slide nnn-aaa-p smoothly together: nap!",
      audioKey: "hint/p1-exp-cvc-04",
    },
    feedback: {
      correctText: "Wonderful reading! n-a-p makes nap!",
      correctAudioKey: "feedback/praise-07",
      encourageText: "Check the starting sound /n/ and try blending again.",
      encourageAudioKey: "feedback/try-again-07",
    },
    offlineParentTip:
      "Notice rhyming pairs built from s, a, t, p, i, n—like 'nap' and 'tap'—by keeping 'ap' still and swapping only the first sound.",
    options: [
      { id: "opt-pan", label: "pan", displayText: "pan", emoji: "🍳", audioKey: "word/pan" },
      { id: "opt-tin", label: "tin", displayText: "tin", emoji: "🥫", audioKey: "word/tin" },
      { id: "opt-sat", label: "sat", displayText: "sat", emoji: "🐱", audioKey: "word/sat" },
      { id: "opt-nap", label: "nap", displayText: "nap", emoji: "😴", audioKey: "word/nap" },
    ],
    correctOptionId: "opt-nap",
  },

  // =========================================================================
  // P1 HIGH-FREQUENCY WORDS (the, in, and, to) — 4 themed exercises
  // =========================================================================
  {
    id: "p1-exp-hfw-01",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "emerging",
    targetWord: "the",
    targetWordAudioKey: "word/the",
    contextSentence: "Look at ___ moon!",
    contextAudioKey: "sentence/look-at-the-moon",
    stimulusEmoji: "🌙",
    prompt: {
      text: "Tap the missing word to finish: Look at ___ moon!",
      audioKey: "prompt/p1-exp-hfw-01",
      visualCueEmoji: "🌙",
    },
    hint: {
      text: "We need the word 'the' — listen as you tap each word card.",
      audioKey: "hint/p1-exp-hfw-01",
    },
    feedback: {
      correctText: "Brilliant! Look at the moon!",
      correctAudioKey: "feedback/praise-11",
      encourageText: "Good try! Tap the sentence card to hear the missing word again.",
      encourageAudioKey: "feedback/try-again-11",
    },
    offlineParentTip:
      "Spot 'the' together on cereal boxes and bedtime books—it appears on almost every page!",
    options: [
      { id: "opt-the", label: "the", displayText: "the", audioKey: "word/the" },
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
      { id: "opt-is", label: "is", displayText: "is", audioKey: "word/is" },
    ],
    correctOptionId: "opt-the",
  },
  {
    id: "p1-exp-hfw-02",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "emerging",
    targetWord: "in",
    targetWordAudioKey: "word/in",
    contextSentence: "The egg is ___ the nest.",
    contextAudioKey: "sentence/the-egg-is-in-the-nest",
    stimulusEmoji: "🪺",
    prompt: {
      text: "Tap the missing word: The egg is ___ the nest.",
      audioKey: "prompt/p1-exp-hfw-02",
      visualCueEmoji: "🪺",
    },
    hint: {
      text: "Blend /i/ and /n/ together to recognise the word 'in'!",
      audioKey: "hint/p1-exp-hfw-02",
    },
    feedback: {
      correctText: "Spot on! The egg is in the nest!",
      correctAudioKey: "feedback/praise-12",
      encourageText: "Almost! Listen for the short word 'in'.",
      encourageAudioKey: "feedback/try-again-12",
    },
    offlineParentTip:
      "Notice that 'in' is completely decodable with Stage 1 sounds (/i/ + /n/). Practise finding 'in' in storybooks.",
    options: [
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
      { id: "opt-and", label: "and", displayText: "and", audioKey: "word/and" },
      { id: "opt-a", label: "a", displayText: "a", audioKey: "word/a" },
    ],
    correctOptionId: "opt-in",
  },
  {
    id: "p1-exp-hfw-03",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "developing",
    targetWord: "and",
    targetWordAudioKey: "word/and",
    contextSentence: "A pig ___ an ant!",
    contextAudioKey: "sentence/a-pig-and-an-ant",
    stimulusEmoji: "🐷",
    prompt: {
      text: "Tap the missing word: A pig ___ an ant!",
      audioKey: "prompt/p1-exp-hfw-03",
      visualCueEmoji: "🐷",
    },
    hint: {
      text: "Look for the joining word 'and' starting with /a/.",
      audioKey: "hint/p1-exp-hfw-03",
    },
    feedback: {
      correctText: "Super reading! A pig and an ant!",
      correctAudioKey: "feedback/praise-01",
      encourageText: "Have another try! Listen to the sentence again.",
      encourageAudioKey: "feedback/try-again-01",
    },
    offlineParentTip:
      "Make quick two-item shopping lists ('milk and apples') and let your child circle the joining word 'and'.",
    options: [
      { id: "opt-the", label: "the", displayText: "the", audioKey: "word/the" },
      { id: "opt-is", label: "is", displayText: "is", audioKey: "word/is" },
      { id: "opt-and", label: "and", displayText: "and", audioKey: "word/and" },
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
    ],
    correctOptionId: "opt-and",
  },
  {
    id: "p1-exp-hfw-04",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "secure",
    targetWord: "to",
    targetWordAudioKey: "word/to",
    contextSentence: "Drive the bus ___ the park!",
    contextAudioKey: "sentence/drive-the-bus-to-the-park",
    stimulusEmoji: "🚌",
    prompt: {
      text: "Tap the missing word: Drive the bus ___ the park!",
      audioKey: "prompt/p1-exp-hfw-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "We are looking for the little word 'to' starting with t.",
      audioKey: "hint/p1-exp-hfw-04",
    },
    feedback: {
      correctText: "Beep beep! Drive the bus to the park!",
      correctAudioKey: "feedback/praise-02",
      encourageText: "Nice try! Look for the two-letter word 'to'.",
      encourageAudioKey: "feedback/try-again-02",
    },
    offlineParentTip:
      "Write 'to' and 'the' on two sticky notes and challenge your child to spot both words on local street or park signs.",
    options: [
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
      { id: "opt-and", label: "and", displayText: "and", audioKey: "word/and" },
      { id: "opt-is", label: "is", displayText: "is", audioKey: "word/is" },
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
    ],
    correctOptionId: "opt-to",
  },

  // =========================================================================
  // TEN-FRAMES 1–10 — 4 themed exercises (numbers 3, 6, 8, 10)
  // =========================================================================
  {
    id: "p1-exp-tf-01",
    type: "ten-frame-count",
    mode: "count-to-numeral",
    skillId: "ccea-p1-num-ten-frames-1-10",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "space",
    difficulty: "developing",
    frameSize: 10,
    targetNumber: 6,
    initialCounters: 6,
    counterVisual: {
      emoji: "⭐",
      label: "gold star",
      colour: "yellow",
      audioKey: "object/star",
    },
    prompt: {
      text: "How many gold stars are shining in the Ten-Frame?",
      audioKey: "prompt/p1-exp-tf-01",
      visualCueEmoji: "⭐",
    },
    hint: {
      text: "The top row is a full 5, plus 1 more underneath makes 6!",
      audioKey: "hint/p1-exp-tf-01",
    },
    feedback: {
      correctText: "Stellar work! 5 and 1 more makes 6 stars!",
      correctAudioKey: "feedback/praise-12",
      encourageText: "Count on from 5 on the top row and try again.",
      encourageAudioKey: "feedback/try-again-12",
    },
    offlineParentTip:
      "Show 5 fingers on one hand and 1 on the other—help your child see 6 straight away as '5 and 1 more'.",
    options: [
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
      { id: "opt-6", label: "6", displayText: "6", audioKey: "number/6" },
      { id: "opt-7", label: "7", displayText: "7", audioKey: "number/7" },
      { id: "opt-8", label: "8", displayText: "8", audioKey: "number/8" },
    ],
    correctOptionId: "opt-6",
  },
  {
    id: "p1-exp-tf-02",
    type: "ten-frame-count",
    mode: "build-on-frame",
    skillId: "ccea-p1-num-ten-frames-1-10",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    frameSize: 10,
    targetNumber: 8,
    initialCounters: 5,
    counterVisual: {
      emoji: "🥚",
      label: "dinosaur egg",
      colour: "green",
      audioKey: "object/dinosaur-egg",
    },
    prompt: {
      text: "There are 5 dinosaur eggs. Tap empty squares to build 8 eggs!",
      audioKey: "prompt/p1-exp-tf-02",
      visualCueEmoji: "🥚",
    },
    hint: {
      text: "5 on top plus 3 more on the bottom makes 8 (leaving 2 empty spaces)!",
      audioKey: "hint/p1-exp-tf-02",
    },
    feedback: {
      correctText: "Fantastic! 5 and 3 more makes 8 dinosaur eggs!",
      correctAudioKey: "feedback/praise-11",
      encourageText: "Count the eggs on your Ten-Frame—we want 8 in total!",
      encourageAudioKey: "feedback/try-again-11",
    },
    offlineParentTip:
      "In an egg-box Ten-Frame with 8 items, ask 'How many more to fill the box?' to naturally plant early bonds to 10 (8 and 2).",
    options: [
      { id: "opt-7", label: "7", displayText: "7", audioKey: "number/7" },
      { id: "opt-8", label: "8", displayText: "8", audioKey: "number/8" },
      { id: "opt-9", label: "9", displayText: "9", audioKey: "number/9" },
    ],
    correctOptionId: "opt-8",
  },
  {
    id: "p1-exp-tf-03",
    type: "ten-frame-count",
    mode: "count-to-numeral",
    skillId: "ccea-p1-num-ten-frames-1-10",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "animals",
    difficulty: "emerging",
    frameSize: 10,
    targetNumber: 3,
    initialCounters: 3,
    counterVisual: {
      emoji: "🐜",
      label: "busy ant",
      colour: "brown",
      audioKey: "word/ant",
    },
    prompt: {
      text: "How many busy ants are marching in the Ten-Frame?",
      audioKey: "prompt/p1-exp-tf-03",
      visualCueEmoji: "🐜",
    },
    hint: {
      text: "Tap each ant to count: 1, 2, 3!",
      audioKey: "hint/p1-exp-tf-03",
    },
    feedback: {
      correctText: "Well done! There are 3 busy ants!",
      correctAudioKey: "feedback/praise-10",
      encourageText: "Tap each ant on the frame to count carefully.",
      encourageAudioKey: "feedback/try-again-10",
    },
    offlineParentTip:
      "Practise subitising 3 at breakfast—spot 3 berries or 3 spoons at a glance without counting one by one.",
    options: [
      { id: "opt-2", label: "2", displayText: "2", audioKey: "number/2" },
      { id: "opt-3", label: "3", displayText: "3", audioKey: "number/3" },
      { id: "opt-4", label: "4", displayText: "4", audioKey: "number/4" },
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
    ],
    correctOptionId: "opt-3",
  },
  {
    id: "p1-exp-tf-04",
    type: "ten-frame-count",
    mode: "build-on-frame",
    skillId: "ccea-p1-num-ten-frames-1-10",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "secure",
    frameSize: 10,
    targetNumber: 10,
    initialCounters: 6,
    counterVisual: {
      emoji: "🚌",
      label: "red bus",
      colour: "red",
      audioKey: "object/bus",
    },
    prompt: {
      text: "6 buses are parked. Fill every empty square to make 10 buses!",
      audioKey: "prompt/p1-exp-tf-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "A completely full Ten-Frame always holds 10!",
      audioKey: "hint/p1-exp-tf-04",
    },
    feedback: {
      correctText: "Full depot! 6 and 4 more fills the whole Ten-Frame — 10!",
      correctAudioKey: "feedback/praise-09",
      encourageText: "Look for any empty white squares left on the Ten-Frame!",
      encourageAudioKey: "feedback/try-again-09",
    },
    offlineParentTip:
      "Celebrate discovering that a full Ten-Frame is always 10—and ask how many extra buses were needed from 6 to reach 10 (4!).",
    options: [
      { id: "opt-8", label: "8", displayText: "8", audioKey: "number/8" },
      { id: "opt-9", label: "9", displayText: "9", audioKey: "number/9" },
      { id: "opt-10", label: "10", displayText: "10", audioKey: "number/10" },
    ],
    correctOptionId: "opt-10",
  },

  // =========================================================================
  // NEW ENGINES: NUMBER LINE HOP, SHAPE SORT, UK COIN JAR, TRACE CANVAS (4)
  // =========================================================================
  {
    id: "p1-exp-nl-01",
    type: "number-line-hop",
    skillId: "ccea-p1-num-bonds-to-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    min: 0,
    max: 10,
    startNumber: 2,
    operation: "add",
    hops: 3,
    targetNumber: 5,
    hopperVisual: {
      emoji: "🚀",
      label: "rocket",
      audioKey: "word/rocket",
    },
    prompt: {
      text: "The rocket starts at 2. Hop forward 3 spaces along the number line!",
      audioKey: "prompt/p1-exp-nl-01",
      visualCueEmoji: "🚀",
    },
    hint: {
      text: "Start on 2 and count 3 hops forward: 3, 4, 5!",
      audioKey: "hint/p1-exp-nl-01",
    },
    feedback: {
      correctText: "Blast off! 2 plus 3 hops lands right on 5!",
      correctAudioKey: "feedback/praise-08",
      encourageText: "Check your hops from 2 — hop forward 3 spaces!",
      encourageAudioKey: "feedback/try-again-08",
    },
    offlineParentTip:
      "Draw a chalk number line from 0 to 10 on the garden path and let your child physically jump 2 steps then 3 more steps to feel 2 + 3 = 5.",
  },
  {
    id: "p1-exp-shape-01",
    type: "shape-sort",
    skillId: "ccea-p1-num-shapes-2d",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "emerging",
    targetShape: "triangle",
    prompt: {
      text: "Drag or tap the triangle into the dinosaur shape bucket!",
      audioKey: "prompt/p1-exp-shape-01",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "A triangle has 3 straight sides and 3 pointy corners!",
      audioKey: "hint/p1-exp-shape-01",
    },
    feedback: {
      correctText: "Brilliant sorting! That is a 3-sided triangle!",
      correctAudioKey: "feedback/praise-01",
      encourageText: "Count the sides — look for the shape with 3 straight sides.",
      encourageAudioKey: "feedback/try-again-01",
    },
    offlineParentTip:
      "Cut sandwiches into triangles and squares at lunch and count the straight sides and corners together.",
    options: [
      { id: "opt-circle", label: "circle", displayText: "circle", audioKey: "shape/circle" },
      { id: "opt-triangle", label: "triangle", displayText: "triangle", audioKey: "shape/triangle" },
      { id: "opt-square", label: "square", displayText: "square", audioKey: "shape/square" },
      { id: "opt-rectangle", label: "rectangle", displayText: "rectangle", audioKey: "shape/rectangle" },
    ],
    correctOptionId: "opt-triangle",
  },
  {
    id: "p1-exp-coin-01",
    type: "uk-coin-match",
    skillId: "ccea-p1-num-coins-1p-5p",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "developing",
    targetPence: 5,
    coinsShown: ["2p", "2p", "1p"],
    prompt: {
      text: "Put UK coins into the jar to pay 5p for a bus ticket!",
      audioKey: "prompt/p1-exp-coin-01",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "You can drop one silver 5p coin, or combine 2p + 2p + 1p!",
      audioKey: "hint/p1-exp-coin-01",
    },
    feedback: {
      correctText: "All aboard! That makes exactly 5p!",
      correctAudioKey: "feedback/praise-07",
      encourageText: "Check the total in the jar — we need 5p altogether.",
      encourageAudioKey: "feedback/try-again-07",
    },
    offlineParentTip:
      "Show your child how one silver 5p coin has the same value as five copper 1p coins, or 2p + 2p + 1p.",
    options: [
      { id: "opt-3p", label: "3p", displayText: "3p", audioKey: "coin/3p" },
      { id: "opt-4p", label: "4p", displayText: "4p", audioKey: "coin/4p" },
      { id: "opt-5p", label: "5p", displayText: "5p", audioKey: "coin/5p" },
    ],
    correctOptionId: "opt-5p",
  },
  {
    id: "p1-exp-trace-01",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    glyph: "s",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/s",
    antiReversalCue:
      "Start at the green 1 dot on the right, slither back over the top, then curve down like a snake!",
    antiReversalAudioKey: "hint/trace-s-anti-reversal",
    startPoint: { x: 66, y: 34 },
    checkpoints: [
      { x: 66, y: 34 },
      { x: 48, y: 26 },
      { x: 34, y: 39 },
      { x: 52, y: 52 },
      { x: 66, y: 65 },
      { x: 48, y: 76 },
      { x: 32, y: 68 },
    ],
    strokeGuidePath:
      "M 66 34 C 60 22, 34 22, 34 39 C 34 52, 66 50, 66 65 C 66 79, 40 80, 32 68",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter s starting at the green 1 dot!",
      audioKey: "prompt/p1-exp-trace-01",
      visualCueEmoji: "🐍",
    },
    hint: {
      text: "Begin at the green 1 dot, curve left over the top, then wiggle down and around!",
      audioKey: "hint/p1-exp-trace-01",
    },
    feedback: {
      correctText: "Super tracing! You wrote the /s/ sound!",
      correctAudioKey: "feedback/praise-01",
      encourageText: "Try starting at the green 1 dot and touching every golden dot along the snake!",
      encourageAudioKey: "feedback/try-again-01",
    },
    offlineParentTip:
      "Pour a thin layer of flour or salt onto a baking tray so your child can practise tracing 's' starting from the top right and curving left first.",
  },
];

/**
 * Sample P2 fixture exercises so `--year P2 --dry-run` can also be verified locally.
 */
const P2_FIXTURE_EXERCISES: readonly Exercise[] = [
  {
    id: "p2-exp-bond-01",
    type: "number-bond",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "space",
    difficulty: "developing",
    whole: 10,
    givenPart: 7,
    missingPart: 3,
    counterVisual: {
      emoji: "⭐",
      label: "gold star",
      colour: "yellow",
      audioKey: "object/star",
    },
    prompt: {
      text: "7 stars plus how many more make 10?",
      audioKey: "prompt/p2-exp-bond-01",
      visualCueEmoji: "⭐",
    },
    hint: {
      text: "Count on from 7 to 10: 8, 9, 10 — that is 3 more!",
      audioKey: "hint/p2-exp-bond-01",
    },
    feedback: {
      correctText: "Super bond to 10! 7 and 3 make 10!",
      correctAudioKey: "feedback/praise-12",
      encourageText: "Count on from 7 using your fingers to reach 10.",
      encourageAudioKey: "feedback/try-again-12",
    },
    options: [
      { id: "opt-2", label: "2", displayText: "2", audioKey: "number/2" },
      { id: "opt-3", label: "3", displayText: "3", audioKey: "number/3" },
      { id: "opt-4", label: "4", displayText: "4", audioKey: "number/4" },
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
    ],
    correctOptionId: "opt-3",
  },
  {
    id: "p2-exp-coin-01",
    type: "uk-coin-match",
    skillId: "ccea-p2-num-coins-to-20p",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "developing",
    targetPence: 12,
    coinsShown: ["10p", "2p"],
    prompt: {
      text: "How much does the bus ticket cost altogether?",
      audioKey: "prompt/p2-exp-coin-01",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Start at 10p and count on 2p more: 11p, 12p!",
      audioKey: "hint/p2-exp-coin-01",
    },
    feedback: {
      correctText: "Spot on! 10p and 2p makes 12p!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Tap each UK coin to hear its value and add them up.",
      encourageAudioKey: "feedback/try-again-04",
    },
    options: [
      { id: "opt-10p", label: "10p", displayText: "10p", audioKey: "coin/10p" },
      { id: "opt-11p", label: "11p", displayText: "11p", audioKey: "coin/11p" },
      { id: "opt-12p", label: "12p", displayText: "12p", audioKey: "coin/12p" },
      { id: "opt-15p", label: "15p", displayText: "15p", audioKey: "coin/15p" },
    ],
    correctOptionId: "opt-12p",
  },
];

export type FixturePreset =
  | "default"
  | "p1-themed-expansion"
  | "p1-core-expansion"
  | "p2-foundation";

export interface FixtureRequest {
  yearGroup: YearGroup;
  skillIds: readonly MicroSkillId[];
  theme: Theme | "all";
  count: number;
  packId: string;
  title: string;
  preset?: FixturePreset;
}

/**
 * Produces a deterministic offline ContentPack from curated NI CCEA fixtures,
 * respecting preset, yearGroup, skillId filter, theme filter, and requested count.
 */
export function buildFixtureContentPack(request: FixtureRequest): ContentPack {
  let bank: readonly Exercise[];
  if (request.preset === "p1-core-expansion") {
    bank = P1_CORE_EXPANSION_EXERCISES;
  } else if (request.preset === "p2-foundation" || request.yearGroup === "P2") {
    bank = P2_FOUNDATION_EXERCISES;
  } else {
    bank = P1_FIXTURE_EXERCISES;
  }

  const skillSet = new Set(request.skillIds);
  let filtered = bank.filter((ex) => {
    const skillMatch = skillSet.size === 0 || skillSet.has(ex.skillId);
    const themeMatch = request.theme === "all" || ex.theme === request.theme;
    return skillMatch && themeMatch;
  });

  // If theme filter narrowed too far for a requested count, fall back cleanly to skill-matched items
  if (filtered.length === 0) {
    filtered = bank.filter(
      (ex) => skillSet.size === 0 || skillSet.has(ex.skillId)
    );
  }
  if (filtered.length === 0) {
    filtered = [...bank];
  }

  const selected = filtered.slice(0, Math.min(request.count, filtered.length));
  const usedSkillIds = Array.from(new Set(selected.map((ex) => ex.skillId)));

  return {
    packId: request.packId,
    version: "1.0.0",
    title: request.title,
    description: `Northern Ireland CCEA Foundation Stage ${request.yearGroup} exercise pack (${selected.length} exercises across ${Array.from(
      new Set(selected.map((e) => e.theme))
    ).join(", ")}).`,
    yearGroup: request.yearGroup,
    locale: "en-GB-NI",
    skillIds: usedSkillIds,
    exercises: selected,
  };
}
