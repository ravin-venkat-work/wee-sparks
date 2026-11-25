import { COMBINED_P1_PACK } from "@/lib/packs";
import { KidSessionPlayer } from "@/components/session/KidSessionPlayer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <KidSessionPlayer pack={COMBINED_P1_PACK} />
    </main>
  );
}
