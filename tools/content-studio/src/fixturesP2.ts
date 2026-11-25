import type { Exercise } from "@wee-sparks/curriculum-schema";

/**
 * Curated offline NI CCEA Primary 2 Foundation Pack bank (20 exercises):
 * 5 per theme (space, dinosaurs, animals, vehicles), covering:
 * - Consonant Digraphs (sh, ch, th, ng) -> PhonicsBuilderEngine
 * - Stage 2 CCVC/CVCC Blending (frog, stop, tent, step) -> PhonicsBuilderEngine
 * - Number Bonds to 10 & 20 -> TapChoiceEngine
 * - 0–20 Number Line Jumps -> NumberLineEngine
 * - UK Coins (1p, 2p, 5p, 10p, 20p) -> DragSortEngine (Coin Jar)
 */
export const P2_FOUNDATION_EXERCISES: readonly Exercise[] = [
  // =========================================================================
  // 1. CONSONANT DIGRAPHS: sh, ch, th, ng (4)
  // =========================================================================
  {
    id: "p2-dig-01",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "emerging",
    targetWord: "ship",
    wordAudioKey: "word/ship",
    phonemes: [
      { grapheme: "sh", audioKey: "phoneme/sh" },
      { grapheme: "i", audioKey: "phoneme/i" },
      { grapheme: "p", audioKey: "phoneme/p" },
    ],
    prompt: {
      text: "Two letters make one sound! Build sh-i-p in the sound boxes and tap the picture.",
      audioKey: "prompt/p2-dig-01",
      visualCueEmoji: "🚢",
    },
    hint: {
      text: "Put the team 'sh' in box 1, then /i/, then /p/: ship!",
      audioKey: "hint/p2-dig-01",
    },
    feedback: {
      correctText: "Ahoy! sh-i-p blends to ship!",
      correctAudioKey: "feedback/correct-p2-dig-01",
      encourageText: "Remember 'sh' works together as one sound in the first box.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Remind your child that 's' and 'h' share ONE Elkonin sound box because together they represent one single sound: /sh/.",
    options: [
      { id: "opt-ship", label: "ship", displayText: "ship", emoji: "🚢", audioKey: "word/ship" },
      { id: "opt-chip", label: "chip", displayText: "chip", emoji: "🍟", audioKey: "word/chip" },
      { id: "opt-moth", label: "moth", displayText: "moth", emoji: "🦋", audioKey: "word/moth" },
      { id: "opt-ring", label: "ring", displayText: "ring", emoji: "💍", audioKey: "word/ring" },
    ],
    correctOptionId: "opt-ship",
  },
  {
    id: "p2-dig-02",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    targetWord: "chip",
    wordAudioKey: "word/chip",
    phonemes: [
      { grapheme: "ch", audioKey: "phoneme/ch" },
      { grapheme: "i", audioKey: "phoneme/i" },
      { grapheme: "p", audioKey: "phoneme/p" },
    ],
    prompt: {
      text: "The cheeky seagull wants a snack! Build ch-i-p and tap the picture.",
      audioKey: "prompt/p2-dig-02",
      visualCueEmoji: "🍟",
    },
    hint: {
      text: "Start with the team sound /ch/, add /i/, finish with /p/: chip!",
      audioKey: "hint/p2-dig-02",
    },
    feedback: {
      correctText: "Yum! ch-i-p makes chip!",
      correctAudioKey: "feedback/correct-p2-dig-02",
      encourageText: "Tap the Slide & Blend button to hear ch-i-p together.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Compare 'ship' and 'chip' side by side—swap only the first digraph tile to see how one team sound changes the whole word.",
    options: [
      { id: "opt-ship", label: "ship", displayText: "ship", emoji: "🚢", audioKey: "word/ship" },
      { id: "opt-chip", label: "chip", displayText: "chip", emoji: "🍟", audioKey: "word/chip" },
      { id: "opt-ring", label: "ring", displayText: "ring", emoji: "💍", audioKey: "word/ring" },
      { id: "opt-moth", label: "moth", displayText: "moth", emoji: "🦋", audioKey: "word/moth" },
    ],
    correctOptionId: "opt-chip",
  },
  {
    id: "p2-dig-03",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetWord: "moth",
    wordAudioKey: "word/moth",
    phonemes: [
      { grapheme: "m", audioKey: "phoneme/m" },
      { grapheme: "o", audioKey: "phoneme/o" },
      { grapheme: "th", audioKey: "phoneme/th" },
    ],
    prompt: {
      text: "A prehistoric moth fluttered by! Build m-o-th in the sound boxes.",
      audioKey: "prompt/p2-dig-03",
      visualCueEmoji: "🦋",
    },
    hint: {
      text: "Blend /m/, /o/, and the team sound /th/ at the end: moth!",
      audioKey: "hint/p2-dig-03",
    },
    feedback: {
      correctText: "Brilliant! m-o-th makes moth!",
      correctAudioKey: "feedback/correct-p2-dig-03",
      encourageText: "Put 'th' together in the last sound box and blend again.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Practise gently poking the tip of the tongue between teeth for the 'th' sound in words like moth, bath, and path.",
    options: [
      { id: "opt-moth", label: "moth", displayText: "moth", emoji: "🦋", audioKey: "word/moth" },
      { id: "opt-ship", label: "ship", displayText: "ship", emoji: "🚢", audioKey: "word/ship" },
      { id: "opt-ring", label: "ring", displayText: "ring", emoji: "💍", audioKey: "word/ring" },
      { id: "opt-chip", label: "chip", displayText: "chip", emoji: "🍟", audioKey: "word/chip" },
    ],
    correctOptionId: "opt-moth",
  },
  {
    id: "p2-dig-04",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    yearGroup: "P2",
    subject: "literacy",
    theme: "space",
    difficulty: "secure",
    targetWord: "ring",
    wordAudioKey: "word/ring",
    phonemes: [
      { grapheme: "r", audioKey: "phoneme/r" },
      { grapheme: "i", audioKey: "phoneme/i" },
      { grapheme: "ng", audioKey: "phoneme/ng" },
    ],
    prompt: {
      text: "Saturn has a shiny ring! Build r-i-ng in the 3 sound boxes.",
      audioKey: "prompt/p2-dig-04",
      visualCueEmoji: "🪐",
    },
    hint: {
      text: "Blend /r/, /i/, and the ending team /ng/: ring!",
      audioKey: "hint/p2-dig-04",
    },
    feedback: {
      correctText: "Out of this world! r-i-ng makes ring!",
      correctAudioKey: "feedback/correct-p2-dig-04",
      encourageText: "Remember 'ng' shares the final sound box as one sound.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Play an 'ng' rhyme game together: ring, sing, wing, king—pointing out that 'n' and 'g' team up for one sound at the end.",
    options: [
      { id: "opt-chip", label: "chip", displayText: "chip", emoji: "🍟", audioKey: "word/chip" },
      { id: "opt-moth", label: "moth", displayText: "moth", emoji: "🦋", audioKey: "word/moth" },
      { id: "opt-ring", label: "ring", displayText: "ring", emoji: "💍", audioKey: "word/ring" },
      { id: "opt-ship", label: "ship", displayText: "ship", emoji: "🚢", audioKey: "word/ship" },
    ],
    correctOptionId: "opt-ring",
  },

  // =========================================================================
  // 2. STAGE 2 CCVC & CVCC BLENDING (4-sound Elkonin boxes — 4)
  // =========================================================================
  {
    id: "p2-ccvc-01",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-cvcc-ccvc",
    yearGroup: "P2",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    targetWord: "frog",
    wordAudioKey: "word/frog",
    phonemes: [
      { grapheme: "f", audioKey: "phoneme/f" },
      { grapheme: "r", audioKey: "phoneme/r" },
      { grapheme: "o", audioKey: "phoneme/o" },
      { grapheme: "g", audioKey: "phoneme/g" },
    ],
    prompt: {
      text: "4 sounds! Build f-r-o-g in the 4 sound boxes and tap the matching card.",
      audioKey: "prompt/p2-ccvc-01",
      visualCueEmoji: "🐸",
    },
    hint: {
      text: "Say all four sounds smoothly: f-r-o-g ... frog!",
      audioKey: "hint/p2-ccvc-01",
    },
    feedback: {
      correctText: "Ribbit! f-r-o-g blends to frog!",
      correctAudioKey: "feedback/correct-p2-ccvc-01",
      encourageText: "Check that you heard both /f/ and /r/ at the start!",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "In Stage 2 Linguistic Phonics, adjacent consonants like 'f' and 'r' each get their own sound box because you can hear both sounds.",
    options: [
      { id: "opt-frog", label: "frog", displayText: "frog", emoji: "🐸", audioKey: "word/frog" },
      { id: "opt-stop", label: "stop", displayText: "stop", emoji: "🛑", audioKey: "word/stop" },
      { id: "opt-tent", label: "tent", displayText: "tent", emoji: "⛺", audioKey: "word/tent" },
      { id: "opt-step", label: "step", displayText: "step", emoji: "🪜", audioKey: "word/step" },
    ],
    correctOptionId: "opt-frog",
  },
  {
    id: "p2-ccvc-02",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-cvcc-ccvc",
    yearGroup: "P2",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "developing",
    targetWord: "stop",
    wordAudioKey: "word/stop",
    phonemes: [
      { grapheme: "s", audioKey: "phoneme/s" },
      { grapheme: "t", audioKey: "phoneme/t" },
      { grapheme: "o", audioKey: "phoneme/o" },
      { grapheme: "p", audioKey: "phoneme/p" },
    ],
    prompt: {
      text: "Red light ahead! Build s-t-o-p in the 4 sound boxes.",
      audioKey: "prompt/p2-ccvc-02",
      visualCueEmoji: "🛑",
    },
    hint: {
      text: "Slide all 4 sounds together: s-t-o-p ... stop!",
      audioKey: "hint/p2-ccvc-02",
    },
    feedback: {
      correctText: "Safe driving! s-t-o-p makes stop!",
      correctAudioKey: "feedback/correct-p2-ccvc-02",
      encourageText: "Tap each sound box to hear all 4 sounds in order.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Spot 'STOP' signs on walks and count the 4 individual sounds together (s-t-o-p) on four fingers.",
    options: [
      { id: "opt-tent", label: "tent", displayText: "tent", emoji: "⛺", audioKey: "word/tent" },
      { id: "opt-stop", label: "stop", displayText: "stop", emoji: "🛑", audioKey: "word/stop" },
      { id: "opt-frog", label: "frog", displayText: "frog", emoji: "🐸", audioKey: "word/frog" },
      { id: "opt-step", label: "step", displayText: "step", emoji: "🪜", audioKey: "word/step" },
    ],
    correctOptionId: "opt-stop",
  },
  {
    id: "p2-ccvc-03",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-cvcc-ccvc",
    yearGroup: "P2",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetWord: "tent",
    wordAudioKey: "word/tent",
    phonemes: [
      { grapheme: "t", audioKey: "phoneme/t" },
      { grapheme: "e", audioKey: "phoneme/e" },
      { grapheme: "n", audioKey: "phoneme/n" },
      { grapheme: "t", audioKey: "phoneme/t" },
    ],
    prompt: {
      text: "Fossil hunters sleep in a t-e-n-t! Build and blend all 4 sounds.",
      audioKey: "prompt/p2-ccvc-03",
      visualCueEmoji: "⛺",
    },
    hint: {
      text: "Listen for both /n/ and /t/ at the end: t-e-n-t!",
      audioKey: "hint/p2-ccvc-03",
    },
    feedback: {
      correctText: "Camp ready! t-e-n-t makes tent!",
      correctAudioKey: "feedback/correct-p2-ccvc-03",
      encourageText: "Check the two ending sounds /n/ and /t/ and try again.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Children often drop the sneaky 'n' in CVCC words like 'tent' or 'hand'—stretch 'tennn-t' slowly so they hear all 4 sounds.",
    options: [
      { id: "opt-frog", label: "frog", displayText: "frog", emoji: "🐸", audioKey: "word/frog" },
      { id: "opt-step", label: "step", displayText: "step", emoji: "🪜", audioKey: "word/step" },
      { id: "opt-tent", label: "tent", displayText: "tent", emoji: "⛺", audioKey: "word/tent" },
      { id: "opt-stop", label: "stop", displayText: "stop", emoji: "🛑", audioKey: "word/stop" },
    ],
    correctOptionId: "opt-tent",
  },
  {
    id: "p2-ccvc-04",
    type: "cvc-blending",
    skillId: "ccea-p2-lit-cvcc-ccvc",
    yearGroup: "P2",
    subject: "literacy",
    theme: "space",
    difficulty: "secure",
    targetWord: "step",
    wordAudioKey: "word/step",
    phonemes: [
      { grapheme: "s", audioKey: "phoneme/s" },
      { grapheme: "t", audioKey: "phoneme/t" },
      { grapheme: "e", audioKey: "phoneme/e" },
      { grapheme: "p", audioKey: "phoneme/p" },
    ],
    prompt: {
      text: "One giant moon s-t-e-p! Build all 4 sounds and match the card.",
      audioKey: "prompt/p2-ccvc-04",
      visualCueEmoji: "🪜",
    },
    hint: {
      text: "Blend /s/, /t/, /e/, /p/ smoothly: step!",
      audioKey: "hint/p2-ccvc-04",
    },
    feedback: {
      correctText: "Moonwalk complete! s-t-e-p makes step!",
      correctAudioKey: "feedback/correct-p2-ccvc-04",
      encourageText: "Tap Slide & Blend to hear all 4 sounds flow into step.",
      encourageAudioKey: "feedback/encourage-cvc-blending",
    },
    offlineParentTip:
      "Swap the vowel in 'stop' to 'e' ('step') on a mini whiteboard or notepad to practise rapid P2 vowel switching.",
    options: [
      { id: "opt-stop", label: "stop", displayText: "stop", emoji: "🛑", audioKey: "word/stop" },
      { id: "opt-tent", label: "tent", displayText: "tent", emoji: "⛺", audioKey: "word/tent" },
      { id: "opt-frog", label: "frog", displayText: "frog", emoji: "🐸", audioKey: "word/frog" },
      { id: "opt-step", label: "step", displayText: "step", emoji: "🪜", audioKey: "word/step" },
    ],
    correctOptionId: "opt-step",
  },

  // =========================================================================
  // 3. NUMBER BONDS TO 10 & 20 (TapChoiceEngine — 4)
  // =========================================================================
  {
    id: "p2-bond-01",
    type: "number-bond",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    whole: 10,
    givenPart: 7,
    missingPart: 3,
    counterVisual: { emoji: "⭐", label: "gold star", colour: "yellow", audioKey: "object/star" },
    prompt: {
      text: "7 stars plus how many more make 10?",
      audioKey: "prompt/p2-bond-01",
      visualCueEmoji: "⭐",
    },
    hint: {
      text: "Count on from 7 to 10: 8, 9, 10 — that is 3 more!",
      audioKey: "hint/p2-bond-01",
    },
    feedback: {
      correctText: "Brilliant bond to 10! 7 and 3 make 10!",
      correctAudioKey: "feedback/correct-p2-bond-01",
      encourageText: "Hold up 7 fingers and count how many are still folded down.",
      encourageAudioKey: "feedback/encourage-number-bond",
    },
    offlineParentTip:
      "Practise quick-fire 'Make 10' pairs on the school run: 'I say 7, you say 3!'",
    options: [
      { id: "opt-2", label: "2", displayText: "2", audioKey: "number/2" },
      { id: "opt-3", label: "3", displayText: "3", audioKey: "number/3" },
      { id: "opt-4", label: "4", displayText: "4", audioKey: "number/4" },
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
    ],
    correctOptionId: "opt-3",
  },
  {
    id: "p2-bond-02",
    type: "number-bond",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    whole: 10,
    givenPart: 6,
    missingPart: 4,
    counterVisual: { emoji: "🥚", label: "dinosaur egg", colour: "green", audioKey: "object/dinosaur-egg" },
    prompt: {
      text: "6 dinosaur eggs plus how many more make 10?",
      audioKey: "prompt/p2-bond-02",
      visualCueEmoji: "🥚",
    },
    hint: {
      text: "Count on from 6 to 10: 7, 8, 9, 10 — 4 more!",
      audioKey: "hint/p2-bond-02",
    },
    feedback: {
      correctText: "Roar-some! 6 and 4 make 10!",
      correctAudioKey: "feedback/correct-p2-bond-02",
      encourageText: "Think of a Ten-Frame with 6 eggs — how many empty spaces remain?",
      encourageAudioKey: "feedback/encourage-number-bond",
    },
    offlineParentTip:
      "Use 10 dried pasta shapes hidden under two cups: show 6 under one cup and ask how many must be hiding under the other.",
    options: [
      { id: "opt-3", label: "3", displayText: "3", audioKey: "number/3" },
      { id: "opt-4", label: "4", displayText: "4", audioKey: "number/4" },
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
      { id: "opt-6", label: "6", displayText: "6", audioKey: "number/6" },
    ],
    correctOptionId: "opt-4",
  },
  {
    id: "p2-bond-03",
    type: "number-bond",
    skillId: "ccea-p2-num-bonds-to-10",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "animals",
    difficulty: "developing",
    whole: 10,
    givenPart: 4,
    missingPart: 6,
    counterVisual: { emoji: "🐜", label: "ant", colour: "brown", audioKey: "word/ant" },
    prompt: {
      text: "4 busy ants plus how many more make 10?",
      audioKey: "prompt/p2-bond-03",
      visualCueEmoji: "🐜",
    },
    hint: {
      text: "If 6 + 4 = 10, then 4 + 6 = 10 too!",
      audioKey: "hint/p2-bond-03",
    },
    feedback: {
      correctText: "Clever switcher! 4 and 6 make 10!",
      correctAudioKey: "feedback/correct-p2-bond-03",
      encourageText: "Count on from 4 up to 10 and try again.",
      encourageAudioKey: "feedback/encourage-number-bond",
    },
    offlineParentTip:
      "Show how number bonds work both ways (6 + 4 = 10 and 4 + 6 = 10) by flipping a row of 10 coloured pegs around.",
    options: [
      { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
      { id: "opt-6", label: "6", displayText: "6", audioKey: "number/6" },
      { id: "opt-7", label: "7", displayText: "7", audioKey: "number/7" },
      { id: "opt-8", label: "8", displayText: "8", audioKey: "number/8" },
    ],
    correctOptionId: "opt-6",
  },
  {
    id: "p2-bond-04",
    type: "number-bond",
    skillId: "ccea-p2-num-add-sub-within-20",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "secure",
    whole: 20,
    givenPart: 12,
    missingPart: 8,
    counterVisual: { emoji: "🚌", label: "bus", colour: "red", audioKey: "object/bus" },
    prompt: {
      text: "Bond to 20! 12 buses plus how many more make 20?",
      audioKey: "prompt/p2-bond-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Use your Make 10 fact: 2 + 8 = 10, so 12 + 8 = 20!",
      audioKey: "hint/p2-bond-04",
    },
    feedback: {
      correctText: "Super bond to 20! 12 and 8 make 20!",
      correctAudioKey: "feedback/correct-p2-bond-04",
      encourageText: "Remember 2 + 8 = 10 — now add one extra ten for 20!",
      encourageAudioKey: "feedback/encourage-number-bond",
    },
    offlineParentTip:
      "Connect bonds to 10 with bonds to 20: 'If 2 + 8 = 10, what must 12 + 8 equal?'",
    options: [
      { id: "opt-6", label: "6", displayText: "6", audioKey: "number/6" },
      { id: "opt-7", label: "7", displayText: "7", audioKey: "number/7" },
      { id: "opt-8", label: "8", displayText: "8", audioKey: "number/8" },
      { id: "opt-9", label: "9", displayText: "9", audioKey: "number/9" },
    ],
    correctOptionId: "opt-8",
  },

  // =========================================================================
  // 4. 0–20 NUMBER LINE JUMPS (NumberLineEngine — 4)
  // =========================================================================
  {
    id: "p2-nl-01",
    type: "number-line-hop",
    skillId: "ccea-p2-num-add-sub-within-20",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    min: 0,
    max: 20,
    startNumber: 8,
    operation: "add",
    hops: 5,
    targetNumber: 13,
    hopperVisual: { emoji: "🚀", label: "rocket", audioKey: "word/rocket" },
    prompt: {
      text: "Start on 8 and hop forward 5 spaces on the 0–20 number line!",
      audioKey: "prompt/p2-nl-01",
      visualCueEmoji: "🚀",
    },
    hint: {
      text: "Hop 2 to reach 10, then 3 more to land on 13!",
      audioKey: "hint/p2-nl-01",
    },
    feedback: {
      correctText: "Cosmic bridging through 10! 8 + 5 = 13!",
      correctAudioKey: "feedback/correct-p2-nl-01",
      encourageText: "Start at 8 and count 5 hops forward: 9, 10, 11, 12, 13.",
      encourageAudioKey: "feedback/encourage-number-line",
    },
    offlineParentTip:
      "Encourage 'bridging through 10': for 8 + 5, jump 2 to hit friendly 10 first, then jump the remaining 3 to 13.",
  },
  {
    id: "p2-nl-02",
    type: "number-line-hop",
    skillId: "ccea-p2-num-add-sub-within-20",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    min: 0,
    max: 20,
    startNumber: 14,
    operation: "subtract",
    hops: 4,
    targetNumber: 10,
    hopperVisual: { emoji: "🦕", label: "dinosaur", audioKey: "object/dinosaur-egg" },
    prompt: {
      text: "Start at 14 and hop back 4 spaces along the 0–20 number line!",
      audioKey: "prompt/p2-nl-02",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "14 is 10 and 4 ones—hop back 4 ones to land on 10!",
      audioKey: "hint/p2-nl-02",
    },
    feedback: {
      correctText: "Spot on! 14 take away 4 lands neatly on 10!",
      correctAudioKey: "feedback/correct-p2-nl-02",
      encourageText: "Tap Hop Back (-1) four times starting from 14.",
      encourageAudioKey: "feedback/encourage-number-line",
    },
    offlineParentTip:
      "Highlight place value in teen numbers: 14 minus 4 leaves the full ten (10) straight away!",
  },
  {
    id: "p2-nl-03",
    type: "number-line-hop",
    skillId: "ccea-p2-num-add-sub-within-20",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "animals",
    difficulty: "developing",
    min: 0,
    max: 20,
    startNumber: 9,
    operation: "add",
    hops: 6,
    targetNumber: 15,
    hopperVisual: { emoji: "🐸", label: "frog", audioKey: "word/frog" },
    prompt: {
      text: "The frog starts on 9. Hop forward 6 spaces on the 0–20 line!",
      audioKey: "prompt/p2-nl-03",
      visualCueEmoji: "🐸",
    },
    hint: {
      text: "Jump 1 from 9 to reach 10, then 5 more to land on 15!",
      audioKey: "hint/p2-nl-03",
    },
    feedback: {
      correctText: "Super frog leaps! 9 + 6 = 15!",
      correctAudioKey: "feedback/correct-p2-nl-03",
      encourageText: "Count 6 hops forward from 9 and try again.",
      encourageAudioKey: "feedback/encourage-number-line",
    },
    offlineParentTip:
      "Practise adding to 9 by turning 9 into 10 first: '9 + 6 is the same as 10 + 5 = 15!'",
  },
  {
    id: "p2-nl-04",
    type: "number-line-hop",
    skillId: "ccea-p2-num-add-sub-within-20",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "secure",
    min: 0,
    max: 20,
    startNumber: 18,
    operation: "subtract",
    hops: 5,
    targetNumber: 13,
    hopperVisual: { emoji: "🚌", label: "bus", audioKey: "object/bus" },
    prompt: {
      text: "The bus starts at stop 18. Hop back 5 stops!",
      audioKey: "prompt/p2-nl-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Since 8 − 5 = 3, 18 − 5 lands on 13!",
      audioKey: "hint/p2-nl-04",
    },
    feedback: {
      correctText: "Great navigating! 18 − 5 = 13!",
      correctAudioKey: "feedback/correct-p2-nl-04",
      encourageText: "Count 5 hops backwards from 18: 17, 16, 15, 14, 13.",
      encourageAudioKey: "feedback/encourage-number-line",
    },
    offlineParentTip:
      "Show how knowing 8 − 5 = 3 unlocks 18 − 5 = 13 without needing to count backwards one by one.",
  },

  // =========================================================================
  // 5. UK COINS: 1p, 2p, 5p, 10p, 20p (DragSortEngine Coin Jar — 4)
  // =========================================================================
  {
    id: "p2-coin-01",
    type: "uk-coin-match",
    skillId: "ccea-p2-num-coins-to-20p",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "emerging",
    targetPence: 12,
    coinsShown: ["10p", "2p"],
    prompt: {
      text: "Drop UK coins into the jar to pay 12p for the bus ticket!",
      audioKey: "prompt/p2-coin-01",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Start with a 10p coin, then add a 2p coin to make 12p!",
      audioKey: "hint/p2-coin-01",
    },
    feedback: {
      correctText: "Ticket paid! 10p and 2p makes 12p!",
      correctAudioKey: "feedback/correct-p2-coin-01",
      encourageText: "Check the total in your coin jar — we need 12p.",
      encourageAudioKey: "feedback/encourage-coins",
    },
    offlineParentTip:
      "Lay out real 10p, 5p, 2p, and 1p coins on the table and ask your child to build 12p starting with the largest coin first.",
    options: [
      { id: "opt-10p", label: "10p", displayText: "10p", audioKey: "coin/10p" },
      { id: "opt-12p", label: "12p", displayText: "12p", audioKey: "coin/12p" },
      { id: "opt-15p", label: "15p", displayText: "15p", audioKey: "coin/15p" },
    ],
    correctOptionId: "opt-12p",
  },
  {
    id: "p2-coin-02",
    type: "uk-coin-match",
    skillId: "ccea-p2-num-coins-to-20p",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "space",
    difficulty: "developing",
    targetPence: 15,
    coinsShown: ["10p", "5p"],
    prompt: {
      text: "Drop UK coins into the jar to make 15p for a space badge!",
      audioKey: "prompt/p2-coin-02",
      visualCueEmoji: "🚀",
    },
    hint: {
      text: "Drop a 10p coin and a 5p coin (or three 5p coins) to make 15p!",
      audioKey: "hint/p2-coin-02",
    },
    feedback: {
      correctText: "Space badge unlocked! That makes 15p!",
      correctAudioKey: "feedback/correct-p2-coin-02",
      encourageText: "Count the coins in your jar—can you make exactly 15p?",
      encourageAudioKey: "feedback/encourage-coins",
    },
    offlineParentTip:
      "Challenge your child to make 15p in two ways using real UK coins: 10p + 5p, and 5p + 5p + 5p.",
    options: [
      { id: "opt-12p", label: "12p", displayText: "12p", audioKey: "coin/12p" },
      { id: "opt-15p", label: "15p", displayText: "15p", audioKey: "coin/15p" },
      { id: "opt-20p", label: "20p", displayText: "20p", audioKey: "coin/20p" },
    ],
    correctOptionId: "opt-15p",
  },
  {
    id: "p2-coin-03",
    type: "uk-coin-match",
    skillId: "ccea-p2-num-coins-to-20p",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetPence: 20,
    coinsShown: ["20p"],
    prompt: {
      text: "Drop UK coins into the jar to pay 20p for the dinosaur museum!",
      audioKey: "prompt/p2-coin-03",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Use one 7-sided 20p coin, or two 10p coins to make 20p!",
      audioKey: "hint/p2-coin-03",
    },
    feedback: {
      correctText: "Museum ticket ready! That totals 20p!",
      correctAudioKey: "feedback/correct-p2-coin-03",
      encourageText: "Try adding 10p + 10p or one silver 20p coin!",
      encourageAudioKey: "feedback/encourage-coins",
    },
    offlineParentTip:
      "Let your child feel the 7-sided edge of a real UK 20p coin and compare it with a round 10p coin.",
    options: [
      { id: "opt-10p", label: "10p", displayText: "10p", audioKey: "coin/10p" },
      { id: "opt-15p", label: "15p", displayText: "15p", audioKey: "coin/15p" },
      { id: "opt-20p", label: "20p", displayText: "20p", audioKey: "coin/20p" },
    ],
    correctOptionId: "opt-20p",
  },
  {
    id: "p2-coin-04",
    type: "uk-coin-match",
    skillId: "ccea-p2-num-coins-to-20p",
    yearGroup: "P2",
    subject: "numeracy",
    theme: "animals",
    difficulty: "secure",
    targetPence: 8,
    coinsShown: ["5p", "2p", "1p"],
    prompt: {
      text: "Combine UK coins in the jar to pay 8p for animal feed!",
      audioKey: "prompt/p2-coin-04",
      visualCueEmoji: "🐷",
    },
    hint: {
      text: "Start with 5p, then add 2p (7p), then 1p more to reach 8p!",
      audioKey: "hint/p2-coin-04",
    },
    feedback: {
      correctText: "Hungry animals fed! 5p + 2p + 1p makes 8p!",
      correctAudioKey: "feedback/correct-p2-coin-04",
      encourageText: "There is no 8p coin—combine 5p, 2p, and 1p coins to make 8p!",
      encourageAudioKey: "feedback/encourage-coins",
    },
    offlineParentTip:
      "Remind your child that UK coins don't include 3p, 4p, 6p, 7p, 8p, or 9p—practise building those amounts by starting with 5p and counting on.",
    options: [
      { id: "opt-7p", label: "7p", displayText: "7p", audioKey: "coin/7p" },
      { id: "opt-8p", label: "8p", displayText: "8p", audioKey: "coin/8p" },
      { id: "opt-9p", label: "9p", displayText: "9p", audioKey: "coin/9p" },
    ],
    correctOptionId: "opt-8p",
  },
];
