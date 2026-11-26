import {
  CCEA_MICRO_SKILL_IDS,
  DifficultyTierSchema,
  ExerciseTypeSchema,
  PRAISE_AUDIO_KEYS,
  SubjectSchema,
  ThemeSchema,
  TRY_AGAIN_AUDIO_KEYS,
  YearGroupSchema,
} from "@wee-sparks/curriculum-schema";

/**
 * JSON Schema representation matching ContentPackSchema / ExerciseSchema
 * for @google/genai structured JSON output (responseJsonSchema).
 * Full Zod validation (including Linguistic Phonics superRefine rules)
 * always runs immediately after generation before writing any pack file.
 */
export function buildContentPackJsonSchema(): Record<string, unknown> {
  const interactiveCardSchema = {
    type: "object",
    required: ["id", "label", "audioKey"],
    properties: {
      id: { type: "string" },
      label: { type: "string" },
      displayText: { type: "string" },
      emoji: { type: "string" },
      audioKey: { type: "string" },
    },
  };

  return {
    type: "object",
    required: [
      "packId",
      "version",
      "title",
      "description",
      "yearGroup",
      "locale",
      "skillIds",
      "exercises",
    ],
    properties: {
      packId: { type: "string" },
      version: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      yearGroup: { type: "string", enum: [...YearGroupSchema.options] },
      locale: { type: "string", enum: ["en-GB-NI"] },
      skillIds: {
        type: "array",
        items: { type: "string", enum: [...CCEA_MICRO_SKILL_IDS] },
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          required: [
            "id",
            "type",
            "skillId",
            "yearGroup",
            "subject",
            "theme",
            "difficulty",
            "prompt",
            "hint",
            "feedback",
          ],
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: [...ExerciseTypeSchema.options] },
            skillId: { type: "string", enum: [...CCEA_MICRO_SKILL_IDS] },
            yearGroup: { type: "string", enum: [...YearGroupSchema.options] },
            subject: { type: "string", enum: [...SubjectSchema.options] },
            theme: { type: "string", enum: [...ThemeSchema.options] },
            difficulty: {
              type: "string",
              enum: [...DifficultyTierSchema.options],
            },
            offlineParentTip: { type: "string" },
            prompt: {
              type: "object",
              required: ["text", "audioKey"],
              properties: {
                text: { type: "string" },
                audioKey: { type: "string" },
                visualCueEmoji: { type: "string" },
              },
            },
            hint: {
              type: "object",
              required: ["text", "audioKey"],
              properties: {
                text: { type: "string" },
                audioKey: { type: "string" },
              },
            },
            feedback: {
              type: "object",
              required: [
                "correctText",
                "correctAudioKey",
                "encourageText",
                "encourageAudioKey",
              ],
              properties: {
                correctText: { type: "string" },
                correctAudioKey: {
                  type: "string",
                  enum: [...PRAISE_AUDIO_KEYS],
                },
                encourageText: { type: "string" },
                encourageAudioKey: {
                  type: "string",
                  enum: [...TRY_AGAIN_AUDIO_KEYS],
                },
              },
            },
            // Template-specific fields
            mode: { type: "string" },
            targetSound: { type: "string" },
            targetSoundAudioKey: { type: "string" },
            stimulus: {
              type: "object",
              properties: {
                label: { type: "string" },
                emoji: { type: "string" },
                audioKey: { type: "string" },
              },
            },
            targetWord: { type: "string" },
            targetWordAudioKey: { type: "string" },
            wordAudioKey: { type: "string" },
            contextSentence: { type: "string" },
            contextAudioKey: { type: "string" },
            stimulusEmoji: { type: "string" },
            phonemes: {
              type: "array",
              items: {
                type: "object",
                required: ["grapheme", "audioKey"],
                properties: {
                  grapheme: { type: "string" },
                  audioKey: { type: "string" },
                },
              },
            },
            frameSize: { type: "integer" },
            targetNumber: { type: "integer" },
            initialCounters: { type: "integer" },
            counterVisual: {
              type: "object",
              properties: {
                emoji: { type: "string" },
                label: { type: "string" },
                colour: { type: "string" },
                audioKey: { type: "string" },
              },
            },
            min: { type: "integer" },
            max: { type: "integer" },
            startNumber: { type: "integer" },
            operation: { type: "string", enum: ["add", "subtract", "count-to"] },
            hops: { type: "integer" },
            hopperVisual: {
              type: "object",
              properties: {
                emoji: { type: "string" },
                label: { type: "string" },
                audioKey: { type: "string" },
              },
            },
            glyph: { type: "string" },
            glyphKind: { type: "string", enum: ["letter", "numeral"] },
            glyphAudioKey: { type: "string" },
            antiReversalCue: { type: "string" },
            antiReversalAudioKey: { type: "string" },
            startPoint: {
              type: "object",
              properties: { x: { type: "number" }, y: { type: "number" } },
            },
            checkpoints: {
              type: "array",
              items: {
                type: "object",
                properties: { x: { type: "number" }, y: { type: "number" } },
              },
            },
            strokeGuidePath: { type: "string" },
            requiredCoverage: { type: "number" },
            options: {
              type: "array",
              items: interactiveCardSchema,
            },
            correctOptionId: { type: "string" },
          },
        },
      },
    },
  };
}
