import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  pickPraiseAudioKey,
  pickTryAgainAudioKey,
  PRAISE_AUDIO_SCRIPTS,
  StoryBookSchema,
  TRY_AGAIN_AUDIO_SCRIPTS,
  type Feedback,
  type StoryBook,
} from "@wee-sparks/curriculum-schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storiesDir = path.resolve(__dirname, "../../../apps/web/src/data/stories");

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

const STORIES: StoryBook[] = [
  {
    storyId: "p1-causeway-adventure",
    version: "1.0.0",
    title: "Sparky & the Causeway Stars",
    subtitle: "Help Sparky follow golden phonics and number clues along the Antrim coast.",
    yearGroup: "P1",
    theme: "animals",
    locale: "en-GB-NI",
    coverIllustration: "causeway-shore",
    companionAvatarId: "sparky",
    offlineParentTip:
      "After finishing Sparky's story, ask your child to retell their favourite stone clue and spot one thing in the room that starts with the pure /s/ sound.",
    chapters: [
      {
        chapterId: "ch-1-sunny-stones",
        title: "The Sunny Stepping Stones",
        illustration: "causeway-shore",
        narrationText:
          "Early one morning at the Giant's Causeway, Sparky spotted a golden lantern glowing by the sea. To wake the first stepping stone, listen for the pure starting sound!",
        narrationAudioKey: "story/p1-causeway-ch1-narration",
        companionMood: "idle",
        visualCueEmoji: "☀️",
        exercise: {
          id: "story-p1-causeway-ex-1",
          type: "initial-sound-match",
          skillId: "ccea-p1-lit-initial-satpin",
          yearGroup: "P1",
          subject: "literacy",
          theme: "animals",
          difficulty: "emerging",
          mode: "sound-to-picture",
          targetSound: "s",
          targetSoundAudioKey: "phoneme/s",
          stimulus: {
            label: "s",
            emoji: "☀️",
            audioKey: "phoneme/s",
          },
          prompt: {
            text: "Tap the picture that starts with the /s/ sound to light Sparky's first stone.",
            audioKey: "story/p1-causeway-ex1-prompt",
            visualCueEmoji: "☀️",
          },
          hint: {
            text: "Listen closely: sss... sun starts with /s/!",
            audioKey: "story/p1-causeway-ex1-hint",
          },
          feedback: sharedFeedback("story-p1-causeway-ex-1"),
          options: [
            { id: "opt-sun", label: "sun", emoji: "☀️", audioKey: "word/sun" },
            { id: "opt-ant", label: "ant", emoji: "🐜", audioKey: "word/ant" },
            { id: "opt-tap", label: "tap", emoji: "🚰", audioKey: "word/tap" },
          ],
          correctOptionId: "opt-sun",
        },
      },
      {
        chapterId: "ch-2-treasure-pin",
        title: "The Shiny Badge Clue",
        illustration: "dino-valley",
        narrationText:
          "Hop, hop! Sparky bounced past the emerald glens and found three glowing letter tiles on a mossy rock. Blend the sounds together to read what Sparky found!",
        narrationAudioKey: "story/p1-causeway-ch2-narration",
        companionMood: "thinking",
        visualCueEmoji: "📌",
        exercise: {
          id: "story-p1-causeway-ex-2",
          type: "cvc-blending",
          skillId: "ccea-p1-lit-cvc-blend-satpin",
          yearGroup: "P1",
          subject: "literacy",
          theme: "animals",
          difficulty: "developing",
          targetWord: "pin",
          wordAudioKey: "word/pin",
          phonemes: [
            { grapheme: "p", audioKey: "phoneme/p" },
            { grapheme: "i", audioKey: "phoneme/i" },
            { grapheme: "n", audioKey: "phoneme/n" },
          ],
          prompt: {
            text: "Tap p, i, n to blend the clue word, then pick its picture!",
            audioKey: "story/p1-causeway-ex2-prompt",
            visualCueEmoji: "📌",
          },
          hint: {
            text: "Push p - i - n together slowly... pin!",
            audioKey: "story/p1-causeway-ex2-hint",
          },
          feedback: sharedFeedback("story-p1-causeway-ex-2"),
          options: [
            { id: "opt-pin", label: "pin", emoji: "📌", audioKey: "word/pin" },
            { id: "opt-pan", label: "pan", emoji: "🍳", audioKey: "word/pan" },
            { id: "opt-tin", label: "tin", emoji: "🥫", audioKey: "word/tin" },
          ],
          correctOptionId: "opt-pin",
        },
      },
      {
        chapterId: "ch-3-counting-stars",
        title: "Stars in the Sea Breeze",
        illustration: "starlight-launch",
        narrationText:
          "Twilight twinkled over the Antrim hills! A shower of friendly sea stars landed right on Sparky's ten-frame. Count how many stars are glowing!",
        narrationAudioKey: "story/p1-causeway-ch3-narration",
        companionMood: "encouraging",
        visualCueEmoji: "⭐",
        exercise: {
          id: "story-p1-causeway-ex-3",
          type: "ten-frame-count",
          skillId: "ccea-p1-num-ten-frames-1-10",
          yearGroup: "P1",
          subject: "numeracy",
          theme: "space",
          difficulty: "developing",
          mode: "count-to-numeral",
          frameSize: 10,
          targetNumber: 6,
          initialCounters: 6,
          counterVisual: {
            emoji: "⭐",
            label: "star",
            colour: "#F59E0B",
            audioKey: "word/star",
          },
          prompt: {
            text: "How many glowing stars landed on Sparky's ten-frame?",
            audioKey: "story/p1-causeway-ex3-prompt",
            visualCueEmoji: "⭐",
          },
          hint: {
            text: "The top row is a full 5, plus 1 more star on the bottom row!",
            audioKey: "story/p1-causeway-ex3-hint",
          },
          feedback: sharedFeedback("story-p1-causeway-ex-3"),
          options: [
            { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
            { id: "opt-6", label: "6", displayText: "6", audioKey: "number/6" },
            { id: "opt-7", label: "7", displayText: "7", audioKey: "number/7" },
          ],
          correctOptionId: "opt-6",
        },
      },
      {
        chapterId: "ch-4-harbour-treat",
        title: "A Coin for the Cove Chest",
        illustration: "treasure-cove",
        narrationText:
          "At last Sparky reached Golden Cove! One last riddle opens the seaside chest: count the UK coin to see how many pence Sparky collected.",
        narrationAudioKey: "story/p1-causeway-ch4-narration",
        companionMood: "celebrating",
        visualCueEmoji: "🪙",
        exercise: {
          id: "story-p1-causeway-ex-4",
          type: "uk-coin-match",
          skillId: "ccea-p1-num-coins-1p-5p",
          yearGroup: "P1",
          subject: "numeracy",
          theme: "animals",
          difficulty: "secure",
          targetPence: 5,
          coinsShown: ["5p"],
          prompt: {
            text: "How much is Sparky's silver UK coin worth?",
            audioKey: "story/p1-causeway-ex4-prompt",
            visualCueEmoji: "🪙",
          },
          hint: {
            text: "Look at the big number on the small silver coin — it says 5p!",
            audioKey: "story/p1-causeway-ex4-hint",
          },
          feedback: sharedFeedback("story-p1-causeway-ex-4"),
          options: [
            { id: "opt-2p", label: "2p", displayText: "2p", audioKey: "coin/2p" },
            { id: "opt-5p", label: "5p", displayText: "5p", audioKey: "coin/5p" },
            { id: "opt-1p", label: "1p", displayText: "1p", audioKey: "coin/1p" },
          ],
          correctOptionId: "opt-5p",
        },
      },
    ],
    finaleTitle: "Causeway Star Explorer!",
    finaleText:
      "Hooray! With every sound and number you solved, Sparky lit up all the stepping stones along the Giant's Causeway!",
    finaleAudioKey: "story/p1-causeway-finale",
    finaleIllustration: "treasure-cove",
    rewardBadgeTitle: "Causeway Star Badge",
  },
  {
    storyId: "p2-rathlin-voyage",
    version: "1.0.0",
    title: "Pip's Voyage to Rathlin Island",
    subtitle: "Sail across the North Channel with Pip using P2 digraphs, number bonds, and coins.",
    yearGroup: "P2",
    theme: "vehicles",
    locale: "en-GB-NI",
    coverIllustration: "rathlin-harbour",
    companionAvatarId: "pip",
    offlineParentTip:
      "Chat about the 'sh' digraph in 'ship' and play a quick game of 'Make 10 Snap' together while waiting for dinner or riding the bus.",
    chapters: [
      {
        chapterId: "ch-1-harbour-ship",
        title: "All Aboard at Ballycastle",
        illustration: "rathlin-harbour",
        narrationText:
          "Pip the Rathlin Puffin packed a bright orange satchel and waddled down to the harbour. Blend the digraph word to see how Pip will cross the waves!",
        narrationAudioKey: "story/p2-rathlin-ch1-narration",
        companionMood: "idle",
        visualCueEmoji: "🚢",
        exercise: {
          id: "story-p2-rathlin-ex-1",
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
            text: "Blend sh, i, p together to find Pip's boat!",
            audioKey: "story/p2-rathlin-ex1-prompt",
            visualCueEmoji: "🚢",
          },
          hint: {
            text: "Remember s and h team up to make one sound: sh - i - p, ship!",
            audioKey: "story/p2-rathlin-ex1-hint",
          },
          feedback: sharedFeedback("story-p2-rathlin-ex-1"),
          options: [
            { id: "opt-ship", label: "ship", emoji: "🚢", audioKey: "word/ship" },
            { id: "opt-fish", label: "fish", emoji: "🐟", audioKey: "word/fish" },
            { id: "opt-shop", label: "shop", emoji: "🏪", audioKey: "word/shop" },
          ],
          correctOptionId: "opt-ship",
        },
      },
      {
        chapterId: "ch-2-lantern-bonds",
        title: "Ten Lanterns for the Lighthouse",
        illustration: "starlight-launch",
        narrationText:
          "Out on the sea breeze, Rathlin's tall lighthouse needs 10 bright lanterns to shine through the mist. Pip has 6 lit already — how many more make 10?",
        narrationAudioKey: "story/p2-rathlin-ch2-narration",
        companionMood: "thinking",
        visualCueEmoji: "🏮",
        exercise: {
          id: "story-p2-rathlin-ex-2",
          type: "number-bond",
          skillId: "ccea-p2-num-bonds-to-10",
          yearGroup: "P2",
          subject: "numeracy",
          theme: "space",
          difficulty: "developing",
          whole: 10,
          givenPart: 6,
          missingPart: 4,
          counterVisual: {
            emoji: "⭐",
            label: "lantern star",
            colour: "#F59E0B",
            audioKey: "word/star",
          },
          prompt: {
            text: "6 and what number make 10 lanterns altogether?",
            audioKey: "story/p2-rathlin-ex2-prompt",
            visualCueEmoji: "⭐",
          },
          hint: {
            text: "Count on from 6 up to 10: 7, 8, 9, 10 — that is 4 more!",
            audioKey: "story/p2-rathlin-ex2-hint",
          },
          feedback: sharedFeedback("story-p2-rathlin-ex-2"),
          options: [
            { id: "opt-3", label: "3", displayText: "3", audioKey: "number/3" },
            { id: "opt-4", label: "4", displayText: "4", audioKey: "number/4" },
            { id: "opt-5", label: "5", displayText: "5", audioKey: "number/5" },
          ],
          correctOptionId: "opt-4",
        },
      },
      {
        chapterId: "ch-3-wave-hops",
        title: "Hopping the Sea Waves",
        illustration: "rathlin-harbour",
        narrationText:
          "Splish, splash! Pip's ferry is at buoy number 9 and needs to hop 5 more waves forward to reach the pier. Jump along the number line!",
        narrationAudioKey: "story/p2-rathlin-ch3-narration",
        companionMood: "encouraging",
        visualCueEmoji: "🐧",
        exercise: {
          id: "story-p2-rathlin-ex-3",
          type: "number-line-hop",
          skillId: "ccea-p2-num-add-sub-within-20",
          yearGroup: "P2",
          subject: "numeracy",
          theme: "vehicles",
          difficulty: "developing",
          min: 0,
          max: 20,
          startNumber: 9,
          operation: "add",
          hops: 5,
          targetNumber: 14,
          hopperVisual: {
            emoji: "🐧",
            label: "Pip",
            audioKey: "word/puffin",
          },
          prompt: {
            text: "Start at 9 and hop forward 5 waves. Where does Pip land?",
            audioKey: "story/p2-rathlin-ex3-prompt",
            visualCueEmoji: "🐧",
          },
          hint: {
            text: "Tap +1 five times from 9: 10, 11, 12, 13, 14!",
            audioKey: "story/p2-rathlin-ex3-hint",
          },
          feedback: sharedFeedback("story-p2-rathlin-ex-3"),
        },
      },
      {
        chapterId: "ch-4-harbour-cafe",
        title: "Coins at the Island Pier",
        illustration: "belfast-depot",
        narrationText:
          "Welcome to Rathlin! Pip wants a warm scone at the harbour café. Add the two UK coins in Pip's pocket to see the total!",
        narrationAudioKey: "story/p2-rathlin-ch4-narration",
        companionMood: "celebrating",
        visualCueEmoji: "🪙",
        exercise: {
          id: "story-p2-rathlin-ex-4",
          type: "uk-coin-match",
          skillId: "ccea-p2-num-coins-to-20p",
          yearGroup: "P2",
          subject: "numeracy",
          theme: "vehicles",
          difficulty: "secure",
          targetPence: 15,
          coinsShown: ["10p", "5p"],
          prompt: {
            text: "How much do Pip's 10p and 5p coins make altogether?",
            audioKey: "story/p2-rathlin-ex4-prompt",
            visualCueEmoji: "🪙",
          },
          hint: {
            text: "Start with 10p and count on 5 more pence to reach 15p!",
            audioKey: "story/p2-rathlin-ex4-hint",
          },
          feedback: sharedFeedback("story-p2-rathlin-ex-4"),
          options: [
            { id: "opt-12p", label: "12p", displayText: "12p", audioKey: "number/12" },
            { id: "opt-15p", label: "15p", displayText: "15p", audioKey: "number/15" },
            { id: "opt-20p", label: "20p", displayText: "20p", audioKey: "coin/20p" },
          ],
          correctOptionId: "opt-15p",
        },
      },
    ],
    finaleTitle: "Rathlin Island Navigator!",
    finaleText:
      "Bravo! Pip sailed safely across the sea, lit the lighthouse, and celebrated with a warm island scone thanks to your super P2 skills!",
    finaleAudioKey: "story/p2-rathlin-finale",
    finaleIllustration: "rathlin-harbour",
    rewardBadgeTitle: "Rathlin Navigator Badge",
  },
];

mkdirSync(storiesDir, { recursive: true });

for (const story of STORIES) {
  const validated = StoryBookSchema.parse(story);
  const outPath = path.join(storiesDir, `${validated.storyId}.json`);
  writeFileSync(outPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  console.log(
    `✓ Wrote story pack ${validated.storyId}.json (${validated.yearGroup}, ${validated.chapters.length} chapters)`
  );
}
