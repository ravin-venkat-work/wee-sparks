import { StoryBookSchema, type StoryBook } from "@wee-sparks/curriculum-schema";
import type { YearGroupFilter } from "@/lib/adaptive/sessionComposer";
import p1CausewayStory from "@/data/stories/p1-causeway-adventure.json";
import p2RathlinStory from "@/data/stories/p2-rathlin-voyage.json";

const RAW_STORIES: readonly unknown[] = [p1CausewayStory, p2RathlinStory];

/**
 * Validated offline CCEA Foundation Stage (P1–P2) illustrated story adventures.
 */
export const ALL_STORY_BOOKS: readonly StoryBook[] = RAW_STORIES.map((raw) =>
  StoryBookSchema.parse(raw)
);

/**
 * Returns stories ordered with the active CCEA stage first (or all stories
 * when filtering by "all") so children can always explore age-right stories.
 */
export function getStoriesForYearFilter(
  filter: YearGroupFilter
): readonly StoryBook[] {
  if (filter === "all") return ALL_STORY_BOOKS;
  const matching = ALL_STORY_BOOKS.filter((s) => s.yearGroup === filter);
  const others = ALL_STORY_BOOKS.filter((s) => s.yearGroup !== filter);
  return [...matching, ...others];
}
