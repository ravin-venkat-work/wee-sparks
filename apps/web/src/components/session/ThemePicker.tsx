"use client";

import type { LearnerThemePreference } from "@/lib/db";

interface ThemePickerProps {
  selectedTheme: LearnerThemePreference;
  onSelectTheme: (theme: LearnerThemePreference) => void;
}

const THEME_OPTIONS: ReadonlyArray<{
  id: LearnerThemePreference;
  label: string;
  emoji: string;
  activeClass: string;
}> = [
  {
    id: "all",
    label: "All",
    emoji: "✨",
    activeClass: "bg-sky-700 text-white ring-sky-300",
  },
  {
    id: "space",
    label: "Space",
    emoji: "🚀",
    activeClass: "bg-indigo-600 text-white ring-indigo-300",
  },
  {
    id: "dinosaurs",
    label: "Dinos",
    emoji: "🦕",
    activeClass: "bg-emerald-700 text-white ring-emerald-300",
  },
  {
    id: "animals",
    label: "Animals",
    emoji: "🦊",
    activeClass: "bg-amber-500 text-slate-950 ring-amber-200",
  },
  {
    id: "vehicles",
    label: "Vehicles",
    emoji: "🚌",
    activeClass: "bg-rose-600 text-white ring-rose-300",
  },
];

/**
 * Tablet-first learner theme selector (>= 64px x 64px touch targets)
 * that switches the adaptive session theme and persists locally in Dexie.
 */
export function ThemePicker({
  selectedTheme,
  onSelectTheme,
}: ThemePickerProps) {
  return (
    <nav
      className="flex flex-wrap items-center gap-2"
      aria-label="Choose learning theme"
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = selectedTheme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectTheme(option.id)}
            className={`touch-card inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-extrabold transition-all sm:text-base ${
              isActive
                ? `shadow-sm ring-4 ${option.activeClass}`
                : "bg-white/95 text-slate-800 ring-2 ring-slate-200 hover:bg-sky-50"
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
