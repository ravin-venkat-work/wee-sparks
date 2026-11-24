import { P1_STARTER_PACK } from "@/lib/packs";
import { KidSessionPlayer } from "@/components/session/KidSessionPlayer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <KidSessionPlayer pack={P1_STARTER_PACK} />
    </main>
  );
}
