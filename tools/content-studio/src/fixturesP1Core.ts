import type { Exercise } from "@wee-sparks/curriculum-schema";

/**
 * Curated offline NI CCEA Primary 1 Core Expansion bank (16 exercises):
 * 4 per theme (space, dinosaurs, animals, vehicles), covering:
 * - High-Frequency Words (is, it, a, I) -> TapChoiceEngine
 * - 2D Shape Sorting (circle, square, rectangle, triangle) -> DragSortEngine
 * - 0–10 Number Line Hopping -> NumberLineEngine
 * - Guided Letter & Numeral Tracing (a, t, 3, 5) -> TraceCanvasEngine
 */
export const P1_CORE_EXPANSION_EXERCISES: readonly Exercise[] = [
  // =========================================================================
  // 1. HIGH-FREQUENCY WORDS (4)
  // =========================================================================
  {
    id: "p1-core-hfw-01",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "space",
    difficulty: "emerging",
    targetWord: "is",
    targetWordAudioKey: "word/is",
    contextSentence: "The sun ___ hot!",
    contextAudioKey: "sentence/the-sun-is-hot",
    stimulusEmoji: "☀️",
    prompt: {
      text: "Tap the missing word: The sun ___ hot!",
      audioKey: "prompt/p1-core-hfw-01",
      visualCueEmoji: "☀️",
    },
    hint: {
      text: "Listen for the two-letter word 'is' in 'The sun is hot!'.",
      audioKey: "hint/p1-core-hfw-01",
    },
    feedback: {
      correctText: "Super! The sun is hot!",
      correctAudioKey: "feedback/praise-05",
      encourageText: "Tap the sentence card to hear the missing word again.",
      encourageAudioKey: "feedback/try-again-05",
    },
    offlineParentTip:
      "Practise spotting 'is' in simple spoken captions ('My cup is blue', 'The dog is big').",
    options: [
      { id: "opt-is", label: "is", displayText: "is", audioKey: "word/is" },
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
      { id: "opt-the", label: "the", displayText: "the", audioKey: "word/the" },
    ],
    correctOptionId: "opt-is",
  },
  {
    id: "p1-core-hfw-02",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "dinosaurs",
    difficulty: "emerging",
    targetWord: "it",
    targetWordAudioKey: "word/it",
    contextSentence: "Look at the egg, ___ can hatch!",
    contextAudioKey: "sentence/look-at-the-egg-it-can-hatch",
    stimulusEmoji: "🥚",
    prompt: {
      text: "Tap the missing word: Look at the egg, ___ can hatch!",
      audioKey: "prompt/p1-core-hfw-02",
      visualCueEmoji: "🥚",
    },
    hint: {
      text: "Blend /i/ and /t/ to recognise 'it'!",
      audioKey: "hint/p1-core-hfw-02",
    },
    feedback: {
      correctText: "Crack-tastic! Look at the egg, it can hatch!",
      correctAudioKey: "feedback/praise-02",
      encourageText: "Try again! Look for the word made from /i/ and /t/.",
      encourageAudioKey: "feedback/try-again-02",
    },
    offlineParentTip:
      "Because 'it' uses Stage 1 sounds (/i/ + /t/), let your child sound it out in picture books rather than guessing.",
    options: [
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
      { id: "opt-it", label: "it", displayText: "it", audioKey: "word/it" },
      { id: "opt-is", label: "is", displayText: "is", audioKey: "word/is" },
      { id: "opt-and", label: "and", displayText: "and", audioKey: "word/and" },
    ],
    correctOptionId: "opt-it",
  },
  {
    id: "p1-core-hfw-03",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "developing",
    targetWord: "a",
    targetWordAudioKey: "word/a",
    contextSentence: "I see ___ pink pig!",
    contextAudioKey: "sentence/i-see-a-pink-pig",
    stimulusEmoji: "🐷",
    prompt: {
      text: "Tap the missing word: I see ___ pink pig!",
      audioKey: "prompt/p1-core-hfw-03",
      visualCueEmoji: "🐷",
    },
    hint: {
      text: "Look for the tiny one-letter word 'a'.",
      audioKey: "hint/p1-core-hfw-03",
    },
    feedback: {
      correctText: "Well done! I see a pink pig!",
      correctAudioKey: "feedback/praise-03",
      encourageText: "Have another go! Listen for the little word 'a'.",
      encourageAudioKey: "feedback/try-again-03",
    },
    offlineParentTip:
      "Point out how the tiny word 'a' stands all by itself with spaces on either side in a sentence.",
    options: [
      { id: "opt-a", label: "a", displayText: "a", audioKey: "word/a" },
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
      { id: "opt-the", label: "the", displayText: "the", audioKey: "word/the" },
      { id: "opt-in", label: "in", displayText: "in", audioKey: "word/in" },
    ],
    correctOptionId: "opt-a",
  },
  {
    id: "p1-core-hfw-04",
    type: "high-frequency-word",
    skillId: "ccea-p1-lit-hfw-p1",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "developing",
    targetWord: "I",
    targetWordAudioKey: "word/i-pronoun",
    contextSentence: "___ like the red bus!",
    contextAudioKey: "sentence/i-like-the-red-bus",
    stimulusEmoji: "🚌",
    prompt: {
      text: "Tap the missing word: ___ like the red bus!",
      audioKey: "prompt/p1-core-hfw-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "When we talk about ourselves, we use the tall word 'I'!",
      audioKey: "hint/p1-core-hfw-04",
    },
    feedback: {
      correctText: "Beep beep! I like the red bus!",
      correctAudioKey: "feedback/praise-08",
      encourageText: "Look for the tall capital word 'I'!",
      encourageAudioKey: "feedback/try-again-08",
    },
    offlineParentTip:
      "Remind your child that the word 'I' is always written as a tall capital letter whenever it talks about a person.",
    options: [
      { id: "opt-to", label: "to", displayText: "to", audioKey: "word/to" },
      { id: "opt-and", label: "and", displayText: "and", audioKey: "word/and" },
      { id: "opt-i", label: "I", displayText: "I", audioKey: "word/i-pronoun" },
      { id: "opt-the", label: "the", displayText: "the", audioKey: "word/the" },
    ],
    correctOptionId: "opt-i",
  },

  // =========================================================================
  // 2. 2D SHAPE SORTING (DragSortEngine — 4)
  // =========================================================================
  {
    id: "p1-core-shape-01",
    type: "shape-sort",
    skillId: "ccea-p1-num-shapes-2d",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    targetShape: "circle",
    prompt: {
      text: "Sort the round circle into the space planet bucket!",
      audioKey: "prompt/p1-core-shape-01",
      visualCueEmoji: "🪐",
    },
    hint: {
      text: "A circle has 1 smooth curved edge and no sharp corners!",
      audioKey: "hint/p1-core-shape-01",
    },
    feedback: {
      correctText: "Stellar sorting! A circle is round with no corners!",
      correctAudioKey: "feedback/praise-03",
      encourageText: "Look for the smooth round shape with zero corners.",
      encourageAudioKey: "feedback/try-again-03",
    },
    offlineParentTip:
      "Trace around mugs, coins, and lids on paper to discover circles of different sizes around the kitchen.",
    options: [
      { id: "opt-circle", label: "circle", displayText: "circle", audioKey: "shape/circle" },
      { id: "opt-square", label: "square", displayText: "square", audioKey: "shape/square" },
      { id: "opt-triangle", label: "triangle", displayText: "triangle", audioKey: "shape/triangle" },
      { id: "opt-rectangle", label: "rectangle", displayText: "rectangle", audioKey: "shape/rectangle" },
    ],
    correctOptionId: "opt-circle",
  },
  {
    id: "p1-core-shape-02",
    type: "shape-sort",
    skillId: "ccea-p1-num-shapes-2d",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    targetShape: "square",
    prompt: {
      text: "Drag or tap the square into the dinosaur fossil bucket!",
      audioKey: "prompt/p1-core-shape-02",
      visualCueEmoji: "🦖",
    },
    hint: {
      text: "A square has 4 equal straight sides and 4 corners!",
      audioKey: "hint/p1-core-shape-02",
    },
    feedback: {
      correctText: "Roar-some! A square has 4 equal sides!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Check the sides — a square has 4 sides all the same length.",
      encourageAudioKey: "feedback/try-again-04",
    },
    offlineParentTip:
      "Compare a square cracker with a rectangular biscuit and count the 4 sides together.",
    options: [
      { id: "opt-triangle", label: "triangle", displayText: "triangle", audioKey: "shape/triangle" },
      { id: "opt-square", label: "square", displayText: "square", audioKey: "shape/square" },
      { id: "opt-circle", label: "circle", displayText: "circle", audioKey: "shape/circle" },
      { id: "opt-rectangle", label: "rectangle", displayText: "rectangle", audioKey: "shape/rectangle" },
    ],
    correctOptionId: "opt-square",
  },
  {
    id: "p1-core-shape-03",
    type: "shape-sort",
    skillId: "ccea-p1-num-shapes-2d",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "animals",
    difficulty: "developing",
    targetShape: "rectangle",
    prompt: {
      text: "Drag or tap the rectangle into the farm gate bucket!",
      audioKey: "prompt/p1-core-shape-03",
      visualCueEmoji: "🐷",
    },
    hint: {
      text: "A rectangle has 2 long sides and 2 short sides!",
      audioKey: "hint/p1-core-shape-03",
    },
    feedback: {
      correctText: "Super! A rectangle has 2 long sides and 2 short sides!",
      correctAudioKey: "feedback/praise-05",
      encourageText: "Look for the stretched shape with 2 long and 2 short sides.",
      encourageAudioKey: "feedback/try-again-05",
    },
    offlineParentTip:
      "Point out rectangular picture frames, doors, and books around the house and trace their long and short sides.",
    options: [
      { id: "opt-circle", label: "circle", displayText: "circle", audioKey: "shape/circle" },
      { id: "opt-triangle", label: "triangle", displayText: "triangle", audioKey: "shape/triangle" },
      { id: "opt-rectangle", label: "rectangle", displayText: "rectangle", audioKey: "shape/rectangle" },
      { id: "opt-square", label: "square", displayText: "square", audioKey: "shape/square" },
    ],
    correctOptionId: "opt-rectangle",
  },
  {
    id: "p1-core-shape-04",
    type: "shape-sort",
    skillId: "ccea-p1-num-shapes-2d",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "secure",
    targetShape: "triangle",
    prompt: {
      text: "Sort the triangle road sign into the vehicle bucket!",
      audioKey: "prompt/p1-core-shape-04",
      visualCueEmoji: "🚕",
    },
    hint: {
      text: "Count 3 pointy corners to spot the triangle!",
      audioKey: "hint/p1-core-shape-04",
    },
    feedback: {
      correctText: "Spot on! Warning road signs are triangles with 3 sides!",
      correctAudioKey: "feedback/praise-06",
      encourageText: "Have another try — count 3 sides for a triangle.",
      encourageAudioKey: "feedback/try-again-06",
    },
    offlineParentTip:
      "On car journeys, spot triangle warning signs and circle speed signs to connect 2D shapes with everyday life.",
    options: [
      { id: "opt-square", label: "square", displayText: "square", audioKey: "shape/square" },
      { id: "opt-rectangle", label: "rectangle", displayText: "rectangle", audioKey: "shape/rectangle" },
      { id: "opt-circle", label: "circle", displayText: "circle", audioKey: "shape/circle" },
      { id: "opt-triangle", label: "triangle", displayText: "triangle", audioKey: "shape/triangle" },
    ],
    correctOptionId: "opt-triangle",
  },

  // =========================================================================
  // 3. 0–10 NUMBER LINE HOPPING (NumberLineEngine — 4)
  // =========================================================================
  {
    id: "p1-core-nl-01",
    type: "number-line-hop",
    skillId: "ccea-p1-num-bonds-to-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    min: 0,
    max: 10,
    startNumber: 1,
    operation: "add",
    hops: 4,
    targetNumber: 5,
    hopperVisual: { emoji: "🚀", label: "rocket", audioKey: "word/rocket" },
    prompt: {
      text: "Start at 1 and hop forward 4 spaces to make 5!",
      audioKey: "prompt/p1-core-nl-01",
      visualCueEmoji: "🚀",
    },
    hint: {
      text: "Count 4 hops on from 1: 2, 3, 4, 5!",
      audioKey: "hint/p1-core-nl-01",
    },
    feedback: {
      correctText: "Blast off! 1 plus 4 hops lands on 5!",
      correctAudioKey: "feedback/praise-02",
      encourageText: "Tap Hop Forward 4 times starting from 1!",
      encourageAudioKey: "feedback/try-again-02",
    },
    offlineParentTip:
      "Show 1 finger on one hand and 4 on the other—celebrate seeing that 1 and 4 always make 5.",
  },
  {
    id: "p1-core-nl-02",
    type: "number-line-hop",
    skillId: "ccea-p1-num-bonds-to-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    min: 0,
    max: 10,
    startNumber: 3,
    operation: "add",
    hops: 2,
    targetNumber: 5,
    hopperVisual: { emoji: "🦕", label: "dinosaur", audioKey: "object/dinosaur-egg" },
    prompt: {
      text: "The dinosaur starts at 3. Hop forward 2 spaces!",
      audioKey: "prompt/p1-core-nl-02",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Start on 3 and jump 2 times: 4, 5!",
      audioKey: "hint/p1-core-nl-02",
    },
    feedback: {
      correctText: "Stomp-tastic! 3 and 2 more makes 5!",
      correctAudioKey: "feedback/praise-05",
      encourageText: "Count 2 hops forward from 3 and check again.",
      encourageAudioKey: "feedback/try-again-05",
    },
    offlineParentTip:
      "Place 3 toy dinosaurs on the table and walk 2 more over—ask your child to count on from 3 rather than recounting from 1.",
  },
  {
    id: "p1-core-nl-03",
    type: "number-line-hop",
    skillId: "ccea-p1-num-bonds-to-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "animals",
    difficulty: "developing",
    min: 0,
    max: 10,
    startNumber: 5,
    operation: "subtract",
    hops: 2,
    targetNumber: 3,
    hopperVisual: { emoji: "🐜", label: "ant", audioKey: "word/ant" },
    prompt: {
      text: "Start at 5 and hop back 2 spaces along the number line!",
      audioKey: "prompt/p1-core-nl-03",
      visualCueEmoji: "🐜",
    },
    hint: {
      text: "Hop backwards from 5: 4, then 3!",
      audioKey: "hint/p1-core-nl-03",
    },
    feedback: {
      correctText: "Clever counting back! 5 take away 2 is 3!",
      correctAudioKey: "feedback/praise-04",
      encourageText: "Use Hop Back (-1) twice starting from 5.",
      encourageAudioKey: "feedback/try-again-04",
    },
    offlineParentTip:
      "Practise counting backwards from 5 to 0 while walking down steps—counting back builds early subtraction fluency.",
  },
  {
    id: "p1-core-nl-04",
    type: "number-line-hop",
    skillId: "ccea-p1-num-ten-frames-1-10",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "vehicles",
    difficulty: "secure",
    min: 0,
    max: 10,
    startNumber: 4,
    operation: "add",
    hops: 5,
    targetNumber: 9,
    hopperVisual: { emoji: "🚌", label: "bus", audioKey: "object/bus" },
    prompt: {
      text: "The bus starts at stop 4. Hop forward 5 stops!",
      audioKey: "prompt/p1-core-nl-04",
      visualCueEmoji: "🚌",
    },
    hint: {
      text: "Count 5 stops on from 4: 5, 6, 7, 8, 9!",
      audioKey: "hint/p1-core-nl-04",
    },
    feedback: {
      correctText: "Next stop 9! 4 plus 5 hops lands on 9!",
      correctAudioKey: "feedback/praise-07",
      encourageText: "Count carefully — 5 hops forward from 4.",
      encourageAudioKey: "feedback/try-again-07",
    },
    offlineParentTip:
      "Use a ruler as a 0–10 number line and slide a toy car along it to act out simple 'count on' journeys.",
  },

  // =========================================================================
  // 4. GUIDED LETTER & NUMBER TRACING (TraceCanvasEngine — 4)
  // =========================================================================
  {
    id: "p1-core-trace-01",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "animals",
    difficulty: "emerging",
    glyph: "a",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/a",
    antiReversalCue:
      "Start at the green 1 dot, curve left around the ant's tummy, go up, then straight down with a little flick!",
    antiReversalAudioKey: "hint/trace-a-anti-reversal",
    startPoint: { x: 64, y: 42 },
    checkpoints: [
      { x: 64, y: 42 },
      { x: 48, y: 34 },
      { x: 34, y: 52 },
      { x: 48, y: 74 },
      { x: 64, y: 58 },
      { x: 64, y: 38 },
      { x: 66, y: 75 },
    ],
    strokeGuidePath:
      "M 64 42 C 56 30, 34 34, 34 54 C 34 74, 56 78, 64 60 L 64 36 L 64 72 C 64 76, 68 78, 72 75",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the letter a for ant starting at the green 1 dot!",
      audioKey: "prompt/p1-core-trace-01",
      visualCueEmoji: "🐜",
    },
    hint: {
      text: "Go round like a caterpillar first, then up and straight down!",
      audioKey: "hint/p1-core-trace-01",
    },
    feedback: {
      correctText: "Lovely letter formation! That is /a/ for ant!",
      correctAudioKey: "feedback/praise-07",
      encourageText: "Start at the green 1 dot and touch the golden checkpoints.",
      encourageAudioKey: "feedback/try-again-07",
    },
    offlineParentTip:
      "Practise drawing big 'a' shapes in the air with a magic finger—always curving left first before going up and down.",
  },
  {
    id: "p1-core-trace-02",
    type: "trace-glyph",
    skillId: "ccea-p1-lit-initial-satpin",
    yearGroup: "P1",
    subject: "literacy",
    theme: "vehicles",
    difficulty: "developing",
    glyph: "t",
    glyphKind: "letter",
    glyphAudioKey: "phoneme/t",
    antiReversalCue:
      "Start tall at the green 1 dot, zip straight down and curl right at the bottom, then cross left-to-right!",
    antiReversalAudioKey: "hint/trace-t-anti-reversal",
    startPoint: { x: 48, y: 20 },
    checkpoints: [
      { x: 48, y: 20 },
      { x: 48, y: 44 },
      { x: 48, y: 68 },
      { x: 58, y: 76 },
      { x: 34, y: 42 },
      { x: 64, y: 42 },
    ],
    strokeGuidePath: "M 48 20 L 48 68 C 48 76, 56 78, 62 74 M 34 42 L 64 42",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the tall letter t for taxi starting at the top green 1 dot!",
      audioKey: "prompt/p1-core-trace-02",
      visualCueEmoji: "🚕",
    },
    hint: {
      text: "Go straight down from the green 1 dot first, then lift and cross across!",
      audioKey: "hint/p1-core-trace-02",
    },
    feedback: {
      correctText: "Terrific tracing! That is /t/ for taxi!",
      correctAudioKey: "feedback/praise-08",
      encourageText: "Remember to start at the top green 1 dot and add the crossbar!",
      encourageAudioKey: "feedback/try-again-08",
    },
    offlineParentTip:
      "Use two lollipop sticks to build a tall 't', reminding your child we always draw top-to-bottom and left-to-right.",
  },
  {
    id: "p1-core-trace-03",
    type: "trace-glyph",
    skillId: "ccea-p1-num-subitise-1-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "space",
    difficulty: "emerging",
    glyph: "3",
    glyphKind: "numeral",
    glyphAudioKey: "number/3",
    antiReversalCue:
      "Start at the green 1 dot on the left, loop out to the right, into the middle, then loop right again!",
    antiReversalAudioKey: "hint/trace-3-anti-reversal",
    startPoint: { x: 34, y: 28 },
    checkpoints: [
      { x: 34, y: 28 },
      { x: 60, y: 30 },
      { x: 48, y: 48 },
      { x: 64, y: 64 },
      { x: 34, y: 74 },
    ],
    strokeGuidePath:
      "M 34 28 C 44 18, 66 22, 62 36 C 60 44, 52 48, 44 48 C 58 50, 68 58, 62 70 C 56 80, 38 78, 34 72",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 3 for 3 space stars!",
      audioKey: "prompt/p1-core-trace-03",
      visualCueEmoji: "⭐",
    },
    hint: {
      text: "Around the tree, around the tree — that is how we make a 3!",
      audioKey: "hint/p1-core-trace-03",
    },
    feedback: {
      correctText: "Star writer! You traced the number 3!",
      correctAudioKey: "feedback/praise-09",
      encourageText: "Start at the green 1 dot on the left so 3 faces the right way!",
      encourageAudioKey: "feedback/try-again-09",
    },
    offlineParentTip:
      "To prevent backwards '3' reversals, place a tiny green sticker on the left edge of the page to remind your child where 3 begins.",
  },
  {
    id: "p1-core-trace-04",
    type: "trace-glyph",
    skillId: "ccea-p1-num-subitise-1-5",
    yearGroup: "P1",
    subject: "numeracy",
    theme: "dinosaurs",
    difficulty: "developing",
    glyph: "5",
    glyphKind: "numeral",
    glyphAudioKey: "number/5",
    antiReversalCue:
      "Start at the green 1 dot: go down, curve a big tummy out to the right, then put a hat on top!",
    antiReversalAudioKey: "hint/trace-5-anti-reversal",
    startPoint: { x: 40, y: 24 },
    checkpoints: [
      { x: 40, y: 24 },
      { x: 38, y: 46 },
      { x: 60, y: 54 },
      { x: 56, y: 74 },
      { x: 36, y: 72 },
      { x: 64, y: 24 },
    ],
    strokeGuidePath:
      "M 40 24 L 38 48 C 52 42, 66 52, 62 66 C 58 78, 42 78, 34 72 M 40 24 L 64 24",
    requiredCoverage: 0.75,
    prompt: {
      text: "Trace the number 5 for 5 dinosaur footprints!",
      audioKey: "prompt/p1-core-trace-04",
      visualCueEmoji: "🦕",
    },
    hint: {
      text: "Down, round a big belly, then put on a flat hat at the top!",
      audioKey: "hint/p1-core-trace-04",
    },
    feedback: {
      correctText: "High five! You traced a brilliant number 5!",
      correctAudioKey: "feedback/praise-10",
      encourageText: "Start at the green 1 dot, curve right, and don't forget the top hat!",
      encourageAudioKey: "feedback/try-again-10",
    },
    offlineParentTip:
      "Use the rhyme 'Down, around, put on a hat!' while tracing 5 with a wet paintbrush on patio stones.",
  },
];
