import { ALL_EXERCISES, ALL_PACK_SKILL_IDS } from "@/lib/packs";
import { KidSessionPlayer } from "@/components/session/KidSessionPlayer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <KidSessionPlayer
        exercises={ALL_EXERCISES}
        availableSkillIds={ALL_PACK_SKILL_IDS}
      />
    </main>
  );
}
