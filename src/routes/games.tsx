import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Section } from "@/components/club/Bits";
import { MathSprint } from "@/components/games/MathSprint";
import { PromptMaster } from "@/components/games/PromptMaster";
import { WeakStrongArena } from "@/components/games/WeakStrongArena";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

const GAMES = [
  { id: "sprint", emoji: "⚡", label: "Math Sprint", intro: "Quick-fire Class 4C mental maths. Go solo, challenge Pixel Bot, or pass the device to a friend." },
  { id: "prompt", emoji: "🧩", label: "Prompt Master", intro: "Assemble a strong AI prompt from role, task, context, and format cards." },
  { id: "arena", emoji: "⚔️", label: "Weak vs Strong", intro: "Spot the stronger prompt in each rapid-fire arena challenge." },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export const Route = createFileRoute("/games")({
  head: () => pageMeta("Games", "Play Math Sprint, Prompt Master, and Weak vs Strong Arena games."),
  component: Games,
});

function Games() {
  const [active, setActive] = useState<GameId>("sprint");
  const selected = GAMES.find((game) => game.id === active)!;
  return (
    <>
      <PageHeader eyebrow="🎮 Math Blog Club" emoji="🕹️" title="Games & Challenges" intro="Play, practise, and earn points. Sign in to add your best scores to the Explorer Rankings." />
      <Section>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap justify-center gap-3" role="tablist" aria-label="Choose a game">
            {GAMES.map((game) => <button key={game.id} type="button" role="tab" aria-selected={active === game.id} onClick={() => setActive(game.id)} className={cn("min-h-12 rounded-full border-2 px-5 font-bold transition", active === game.id ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card hover:border-primary/60")}><span aria-hidden="true">{game.emoji}</span> {game.label}</button>)}
          </div>
          <div className="card-fun space-y-5 p-5 sm:p-8">
            <div><h2 className="font-display text-2xl font-bold sm:text-3xl">{selected.emoji} {selected.label}</h2><p className="mt-1 text-muted-foreground">{selected.intro}</p></div>
            {active === "sprint" ? <MathSprint /> : active === "prompt" ? <PromptMaster /> : <WeakStrongArena />}
          </div>
          <div className="rounded-2xl border bg-card/60 p-4 text-center text-sm text-muted-foreground"><span className="font-bold text-foreground">🏅 Points & privacy:</span> Game scores are saved to your club leaderboard only when you sign in. Games can also be played without signing in; those scores stay on this device.</div>
        </div>
      </Section>
    </>
  );
}
