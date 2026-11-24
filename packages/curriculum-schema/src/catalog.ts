import { z } from "zod";
import {
  AudioKeySchema,
  CurriculumStrandSchema,
  SubjectSchema,
  YearGroupSchema,
} from "./enums";

/**
 * Canonical list of CCEA Foundation Stage (P1–P2) micro-skill IDs.
 */
export const CCEA_MICRO_SKILL_IDS = [
  // Primary 1 — Language & Literacy (NI Linguistic Phonics Stage 1)
  "ccea-p1-lit-initial-satpin",
  "ccea-p1-lit-cvc-blend-satpin",
  "ccea-p1-lit-initial-ckehrmd",
  "ccea-p1-lit-cvc-segment-stage1",
  "ccea-p1-lit-initial-goulfb",
  "ccea-p1-lit-hfw-p1",

  // Primary 1 — Mathematics & Numeracy
  "ccea-p1-num-subitise-1-5",
  "ccea-p1-num-ten-frames-1-10",
  "ccea-p1-num-bonds-to-5",
  "ccea-p1-num-shapes-2d",
  "ccea-p1-num-coins-1p-5p",

  // Primary 2 — Language & Literacy (NI Linguistic Phonics Stages 2–4)
  "ccea-p2-lit-cvcc-ccvc",
  "ccea-p2-lit-digraphs-sh-ch-th-ng",
  "ccea-p2-lit-double-letters",
  "ccea-p2-lit-vowel-sounds",
  "ccea-p2-lit-captions-comprehension",

  // Primary 2 — Mathematics & Numeracy
  "ccea-p2-num-ten-frames-11-20",
  "ccea-p2-num-bonds-to-10",
  "ccea-p2-num-add-sub-within-20",
  "ccea-p2-num-coins-to-20p",
  "ccea-p2-num-shapes-3d",
] as const;

export const MicroSkillIdSchema = z.enum(CCEA_MICRO_SKILL_IDS);
export type MicroSkillId = z.infer<typeof MicroSkillIdSchema>;

export const MasteryThresholdSchema = z.object({
  minAttempts: z.number().int().min(1).max(20),
  minAccuracy: z.number().min(0.5).max(1),
});
export type MasteryThreshold = z.infer<typeof MasteryThresholdSchema>;

export const MicroSkillSchema = z.object({
  id: MicroSkillIdSchema,
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  yearGroup: YearGroupSchema,
  subject: SubjectSchema,
  strand: CurriculumStrandSchema,
  cceaReference: z.string().min(1),
  linguisticPhonicsStage: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]).optional(),
  targetGraphemes: z.array(z.string().min(1)).optional(),
  prerequisiteSkillIds: z.array(MicroSkillIdSchema),
  masteryThreshold: MasteryThresholdSchema,
  offlineParentTip: z.string().min(15),
  audioKey: AudioKeySchema,
});
export type MicroSkill = z.infer<typeof MicroSkillSchema>;

/**
 * CCEA Foundation Stage (P1–P2) Micro-Skill Catalog.
 * All descriptions and parent tips use Northern Ireland / UK English and
 * CCEA Linguistic Phonics terminology.
 */
export const CCEA_FOUNDATION_SKILLS: readonly MicroSkill[] = [
  // =========================================================================
  // PRIMARY 1 — LANGUAGE & LITERACY
  // =========================================================================
  {
    id: "ccea-p1-lit-initial-satpin",
    code: "P1.LIT.1",
    title: "Initial Sounds: s, a, t, p, i, n",
    description:
      "Hear and recognise the first sound in spoken words using Linguistic Phonics Stage 1 starter sounds (s, a, t, p, i, n).",
    yearGroup: "P1",
    subject: "literacy",
    strand: "linguistic-phonics-stage-1",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Talking, Listening & Linguistic Phonics Stage 1 (1:1 sound-letter correspondence)",
    linguisticPhonicsStage: 1,
    targetGraphemes: ["s", "a", "t", "p", "i", "n"],
    prerequisiteSkillIds: [],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.8 },
    offlineParentTip:
      "Play 'I Spy with my little ear' on the walk to school using pure letter sounds (say 'ssss' rather than 'ess'). Spot things starting with s, a, t, p, i, or n.",
    audioKey: "skill/ccea-p1-lit-initial-satpin",
  },
  {
    id: "ccea-p1-lit-cvc-blend-satpin",
    code: "P1.LIT.2",
    title: "CVC Blending (s, a, t, p, i, n)",
    description:
      "Push three single sounds together in order to read simple CVC words built strictly from s, a, t, p, i, n (such as sat, pin, tap, pan, tin).",
    yearGroup: "P1",
    subject: "literacy",
    strand: "linguistic-phonics-stage-1",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Reading & Linguistic Phonics Stage 1 (blending 3-sound CVC words)",
    linguisticPhonicsStage: 1,
    targetGraphemes: ["s", "a", "t", "p", "i", "n"],
    prerequisiteSkillIds: ["ccea-p1-lit-initial-satpin"],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "Write s, a, t, p, i, n on sticky notes and place three in a row on the fridge. Slide a finger underneath as you say each sound slowly, then sweep faster to hear the whole word.",
    audioKey: "skill/ccea-p1-lit-cvc-blend-satpin",
  },
  {
    id: "ccea-p1-lit-initial-ckehrmd",
    code: "P1.LIT.3",
    title: "Initial Sounds: c, k, e, h, r, m, d",
    description:
      "Recognise and match the next Stage 1 single letter sounds (c, k, e, h, r, m, d) at the beginning of everyday spoken words.",
    yearGroup: "P1",
    subject: "literacy",
    strand: "linguistic-phonics-stage-1",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 1 (extending 1:1 sound-letter correspondence)",
    linguisticPhonicsStage: 1,
    targetGraphemes: ["c", "k", "e", "h", "r", "m", "d"],
    prerequisiteSkillIds: ["ccea-p1-lit-initial-satpin"],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.8 },
    offlineParentTip:
      "Gather four kitchen items (e.g. cup, mug, egg, dish) and ask your child to group them by their starting sound.",
    audioKey: "skill/ccea-p1-lit-initial-ckehrmd",
  },
  {
    id: "ccea-p1-lit-cvc-segment-stage1",
    code: "P1.LIT.4",
    title: "CVC Segmenting with Sound Boxes",
    description:
      "Hear a spoken CVC word, stretch it into three individual sounds, and place each grapheme into Elkonin sound boxes.",
    yearGroup: "P1",
    subject: "literacy",
    strand: "linguistic-phonics-stage-1",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Writing & Linguistic Phonics Stage 1 (segmenting to spell CVC words)",
    linguisticPhonicsStage: 1,
    targetGraphemes: ["s", "a", "t", "p", "i", "n", "c", "k", "e", "h", "r", "m", "d"],
    prerequisiteSkillIds: [
      "ccea-p1-lit-cvc-blend-satpin",
      "ccea-p1-lit-initial-ckehrmd",
    ],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "Draw three boxes on paper and give your child three buttons. Say a short word like 'mat' and have them push one button into a box for each sound they hear.",
    audioKey: "skill/ccea-p1-lit-cvc-segment-stage1",
  },
  {
    id: "ccea-p1-lit-initial-goulfb",
    code: "P1.LIT.5",
    title: "Initial Sounds: g, o, u, l, f, b & Remaining Stage 1",
    description:
      "Consolidate all remaining single 1:1 consonant and short vowel sounds in Linguistic Phonics Stage 1.",
    yearGroup: "P1",
    subject: "literacy",
    strand: "linguistic-phonics-stage-1",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 1 (complete single-letter code)",
    linguisticPhonicsStage: 1,
    targetGraphemes: ["g", "o", "u", "l", "f", "b", "j", "v", "w", "x", "y", "z"],
    prerequisiteSkillIds: ["ccea-p1-lit-initial-ckehrmd"],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.8 },
    offlineParentTip:
      "Use magnetic letters or letter cards during tidy-up time: pick a letter card and race to find one toy that starts with that sound.",
    audioKey: "skill/ccea-p1-lit-initial-goulfb",
  },
  {
    id: "ccea-p1-lit-hfw-p1",
    code: "P1.LIT.6",
    title: "P1 High-Frequency Words",
    description:
      "Recognise common P1 words (such as I, the, to, a, is, in, it, and) quickly by sound and sight in short phrases.",
    yearGroup: "P1",
    subject: "literacy",
    strand: "high-frequency-words",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Reading high-frequency words in context",
    linguisticPhonicsStage: 1,
    prerequisiteSkillIds: ["ccea-p1-lit-cvc-blend-satpin"],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "When reading a bedtime picture book together, pause when you reach 'the' or 'and' so your child can jump in and read that word aloud.",
    audioKey: "skill/ccea-p1-lit-hfw-p1",
  },

  // =========================================================================
  // PRIMARY 1 — MATHEMATICS & NUMERACY
  // =========================================================================
  {
    id: "ccea-p1-num-subitise-1-5",
    code: "P1.NUM.1",
    title: "Subitising & Counting 1–5",
    description:
      "Recognise small sets of 1 to 5 objects at a glance without counting one by one, and match them to numerals.",
    yearGroup: "P1",
    subject: "numeracy",
    strand: "number-sense",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Understanding Number (counting & subitising within 5)",
    prerequisiteSkillIds: [],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Roll a standard dot dice together and call out the number as quickly as you can without pointing to count each dot.",
    audioKey: "skill/ccea-p1-num-subitise-1-5",
  },
  {
    id: "ccea-p1-num-ten-frames-1-10",
    code: "P1.NUM.2",
    title: "Ten-Frames 1–10",
    description:
      "Use a Ten-Frame to subitise, count, and build numbers from 1 to 10, noticing the benchmark of 5 on the top row and how many more make 10.",
    yearGroup: "P1",
    subject: "numeracy",
    strand: "number-sense",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Understanding Number (counting, ordering & visualising numbers to 10)",
    prerequisiteSkillIds: ["ccea-p1-num-subitise-1-5"],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "Cut an egg box down to 10 cups (two rows of 5) to make a real Ten-Frame. Ask your child to place grapes or pasta shapes inside to show 7, then ask how many empty spaces are left.",
    audioKey: "skill/ccea-p1-num-ten-frames-1-10",
  },
  {
    id: "ccea-p1-num-bonds-to-5",
    code: "P1.NUM.3",
    title: "Number Bonds to 5",
    description:
      "Explore all the ways two smaller groups combine to make 5 (such as 3 and 2, or 4 and 1).",
    yearGroup: "P1",
    subject: "numeracy",
    strand: "addition-subtraction",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Number Operations (partitioning and combining sets within 5)",
    prerequisiteSkillIds: ["ccea-p1-num-subitise-1-5"],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Hold up 5 fingers and fold some down behind your back. Ask your child to count the fingers showing and figure out how many are hiding.",
    audioKey: "skill/ccea-p1-num-bonds-to-5",
  },
  {
    id: "ccea-p1-num-shapes-2d",
    code: "P1.NUM.4",
    title: "Recognising 2D Shapes & Patterns",
    description:
      "Identify circles, squares, triangles, and rectangles in everyday scenes and continue simple repeating colour or shape patterns.",
    yearGroup: "P1",
    subject: "numeracy",
    strand: "shape-space",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Shape and Space & Patterns (2D shapes and repeating sequences)",
    prerequisiteSkillIds: [],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "Go on a shape hunt around the living room: count how many rectangles (doors, books, cushions) and circles (clocks, plates, wheels) you can find.",
    audioKey: "skill/ccea-p1-num-shapes-2d",
  },
  {
    id: "ccea-p1-num-coins-1p-5p",
    code: "P1.NUM.5",
    title: "Recognising UK Coins (1p, 2p, 5p)",
    description:
      "Recognise Northern Ireland / UK 1p, 2p, and 5p coins by colour, size, and numeral, and count out small totals up to 5p.",
    yearGroup: "P1",
    subject: "numeracy",
    strand: "measures-money",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Money (recognising 1p, 2p, and 5p coins in play contexts)",
    prerequisiteSkillIds: ["ccea-p1-num-subitise-1-5"],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "Set up a pretend shop with toys priced at 1p, 2p, and 5p. Let your child pay using real 1p, 2p, and 5p coins and talk about the copper vs silver colour.",
    audioKey: "skill/ccea-p1-num-coins-1p-5p",
  },

  // =========================================================================
  // PRIMARY 2 — LANGUAGE & LITERACY
  // =========================================================================
  {
    id: "ccea-p2-lit-cvcc-ccvc",
    code: "P2.LIT.1",
    title: "Adjacent Consonants: CVCC & CCVC Blending",
    description:
      "Blend and segment four-sound words with adjacent consonants (such as frog, lamp, tent, stop) in Linguistic Phonics Stage 2.",
    yearGroup: "P2",
    subject: "literacy",
    strand: "linguistic-phonics-stage-2",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 2 (CVCC, CCVC, and CCVCC words)",
    linguisticPhonicsStage: 2,
    prerequisiteSkillIds: ["ccea-p1-lit-cvc-segment-stage1"],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Practise 'robot talk' with 4-sound words at dinner (e.g. 'f-o-r-k' or 'm-i-l-k') and let your child blend the robot's sounds into the real word.",
    audioKey: "skill/ccea-p2-lit-cvcc-ccvc",
  },
  {
    id: "ccea-p2-lit-digraphs-sh-ch-th-ng",
    code: "P2.LIT.2",
    title: "Consonant Digraphs: sh, ch, th, ng",
    description:
      "Recognise that two letters work together to represent one sound in sh, ch, th, and ng (such as ship, chip, moth, ring).",
    yearGroup: "P2",
    subject: "literacy",
    strand: "linguistic-phonics-stage-3-4",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 3/4 (two letters representing one consonant sound)",
    linguisticPhonicsStage: 3,
    targetGraphemes: ["sh", "ch", "th", "ng"],
    prerequisiteSkillIds: ["ccea-p2-lit-cvcc-ccvc"],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.8 },
    offlineParentTip:
      "Spot 'sh', 'ch', 'th', and 'ng' on road signs and shop labels (like 'Shop', 'Fish', 'Chips', 'Ring') and remind your child those two letters make one team sound.",
    audioKey: "skill/ccea-p2-lit-digraphs-sh-ch-th-ng",
  },
  {
    id: "ccea-p2-lit-double-letters",
    code: "P2.LIT.3",
    title: "Double Letter Endings: ff, ll, ss, zz",
    description:
      "Read and spell words ending with double consonant spellings (ff, ll, ss, zz) where two matching letters represent one sound.",
    yearGroup: "P2",
    subject: "literacy",
    strand: "linguistic-phonics-stage-3-4",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 3 (double-letter representations)",
    linguisticPhonicsStage: 3,
    targetGraphemes: ["ff", "ll", "ss", "zz"],
    prerequisiteSkillIds: ["ccea-p2-lit-cvcc-ccvc"],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Make a rhyme chain together with double-letter words like 'bell, fell, shell, well' or 'hiss, miss, kiss' while tidying up.",
    audioKey: "skill/ccea-p2-lit-double-letters",
  },
  {
    id: "ccea-p2-lit-vowel-sounds",
    code: "P2.LIT.4",
    title: "Target Vowel Representations (ee/ea, ai/ay, oa/ow)",
    description:
      "Understand that one vowel sound can be spelled in more than one way (such as ee/ea in tree and leaf, or ai/ay in rain and play).",
    yearGroup: "P2",
    subject: "literacy",
    strand: "linguistic-phonics-stage-3-4",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Linguistic Phonics Stage 4 (multiple representations of target vowel sounds)",
    linguisticPhonicsStage: 4,
    targetGraphemes: ["ee", "ea", "ai", "ay", "oa", "ow"],
    prerequisiteSkillIds: ["ccea-p2-lit-digraphs-sh-ch-th-ng"],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.8 },
    offlineParentTip:
      "Pick one sound of the week (like the 'ee' sound) and keep a little tally on the fridge every time you spot a word with that sound in a storybook.",
    audioKey: "skill/ccea-p2-lit-vowel-sounds",
  },
  {
    id: "ccea-p2-lit-captions-comprehension",
    code: "P2.LIT.5",
    title: "Simple Sentences & Picture Comprehension",
    description:
      "Read short decodable captions and sentences and match them accurately to pictures or simple story questions.",
    yearGroup: "P2",
    subject: "literacy",
    strand: "reading-comprehension",
    cceaReference:
      "CCEA Foundation Stage: Language & Literacy — Reading for meaning and understanding simple texts",
    prerequisiteSkillIds: [
      "ccea-p1-lit-hfw-p1",
      "ccea-p2-lit-digraphs-sh-ch-th-ng",
    ],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.8 },
    offlineParentTip:
      "After reading a short page together, ask your child to retell what happened in their own words before turning to the next page.",
    audioKey: "skill/ccea-p2-lit-captions-comprehension",
  },

  // =========================================================================
  // PRIMARY 2 — MATHEMATICS & NUMERACY
  // =========================================================================
  {
    id: "ccea-p2-num-ten-frames-11-20",
    code: "P2.NUM.1",
    title: "Double Ten-Frames & Place Value (11–20)",
    description:
      "Represent numbers from 11 to 20 on two Ten-Frames as 'one full ten and some more ones'.",
    yearGroup: "P2",
    subject: "numeracy",
    strand: "number-sense",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Understanding Number (counting, reading & building numbers to 20)",
    prerequisiteSkillIds: ["ccea-p1-num-ten-frames-1-10"],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Bundle 10 lollipop sticks or straws with an elastic band to make '1 ten', then add loose ones beside it to build teen numbers like 14 (1 ten and 4 ones).",
    audioKey: "skill/ccea-p2-num-ten-frames-11-20",
  },
  {
    id: "ccea-p2-num-bonds-to-10",
    code: "P2.NUM.2",
    title: "Number Bonds to 10",
    description:
      "Recall and build pairs of numbers that total 10 (such as 6 + 4, 7 + 3, 8 + 2) using Ten-Frames and part-whole models.",
    yearGroup: "P2",
    subject: "numeracy",
    strand: "addition-subtraction",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Number Operations (recall of addition facts within 10)",
    prerequisiteSkillIds: [
      "ccea-p1-num-ten-frames-1-10",
      "ccea-p1-num-bonds-to-5",
    ],
    masteryThreshold: { minAttempts: 6, minAccuracy: 0.85 },
    offlineParentTip:
      "Play 'Make 10 Snap' in the car: you say a number from 0 to 10 (e.g. '7!') and your child shouts back its partner to make 10 ('3!').",
    audioKey: "skill/ccea-p2-num-bonds-to-10",
  },
  {
    id: "ccea-p2-num-add-sub-within-20",
    code: "P2.NUM.3",
    title: "Practical Addition & Subtraction within 20",
    description:
      "Add and subtract within 20 using counting on, taking away, and Ten-Frame strategies in real-life stories.",
    yearGroup: "P2",
    subject: "numeracy",
    strand: "addition-subtraction",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Number Operations (addition and subtraction within 20)",
    prerequisiteSkillIds: [
      "ccea-p2-num-ten-frames-11-20",
      "ccea-p2-num-bonds-to-10",
    ],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Use snack time for quick number stories: 'We have 12 blueberries and you ate 3 — how many are left on your plate?'",
    audioKey: "skill/ccea-p2-num-add-sub-within-20",
  },
  {
    id: "ccea-p2-num-coins-to-20p",
    code: "P2.NUM.4",
    title: "Counting & Combining UK Coins (1p, 2p, 5p, 10p, 20p)",
    description:
      "Recognise all Foundation Stage UK coins (1p, 2p, 5p, 10p, 20p) and combine coins to make totals up to 20p.",
    yearGroup: "P2",
    subject: "numeracy",
    strand: "measures-money",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Money (using 1p, 2p, 5p, 10p, and 20p coins up to 20p)",
    prerequisiteSkillIds: [
      "ccea-p1-num-coins-1p-5p",
      "ccea-p2-num-bonds-to-10",
    ],
    masteryThreshold: { minAttempts: 5, minAccuracy: 0.8 },
    offlineParentTip:
      "Put a handful of 1p, 2p, 5p, and 10p coins in a bowl and challenge your child to find two different ways to make 10p or 15p.",
    audioKey: "skill/ccea-p2-num-coins-to-20p",
  },
  {
    id: "ccea-p2-num-shapes-3d",
    code: "P2.NUM.5",
    title: "Recognising 3D Shapes in Everyday Objects",
    description:
      "Recognise cubes, spheres, cylinders, and cones and describe whether they roll, stack, or slide.",
    yearGroup: "P2",
    subject: "numeracy",
    strand: "shape-space",
    cceaReference:
      "CCEA Foundation Stage: Mathematics & Numeracy — Shape and Space (sorting and naming everyday 3D shapes)",
    prerequisiteSkillIds: ["ccea-p1-num-shapes-2d"],
    masteryThreshold: { minAttempts: 4, minAccuracy: 0.75 },
    offlineParentTip:
      "While unpacking the shopping, sort items by 3D shape: baked-bean tins are cylinders, oranges are spheres, and dice or small boxes are cubes.",
    audioKey: "skill/ccea-p2-num-shapes-3d",
  },
];

const SKILL_MAP = new Map<MicroSkillId, MicroSkill>(
  CCEA_FOUNDATION_SKILLS.map((skill) => [skill.id, skill])
);

export function getMicroSkillById(id: MicroSkillId): MicroSkill {
  const skill = SKILL_MAP.get(id);
  if (!skill) {
    throw new Error(`Unknown CCEA micro-skill ID: ${id}`);
  }
  return skill;
}

export function getSkillsByYearGroup(yearGroup: "P1" | "P2"): MicroSkill[] {
  return CCEA_FOUNDATION_SKILLS.filter((skill) => skill.yearGroup === yearGroup);
}

export function getSkillsBySubject(
  subject: "literacy" | "numeracy"
): MicroSkill[] {
  return CCEA_FOUNDATION_SKILLS.filter((skill) => skill.subject === subject);
}
