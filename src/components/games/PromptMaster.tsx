import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROMPT_MISSIONS, PUZZLE_SLOT_CARDS, type CardSlot, type PuzzleComponentCard } from "@/lib/games-data";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { recordGameResult } from "@/lib/learning.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SLOTS: { id: CardSlot; label: string; emoji: string; hint: string }[] = [
  { id: "role", label: "ROLE", emoji: "🎭", hint: "Who should the AI act as?" },
  { id: "task", label: "TASK", emoji: "🎯", hint: "What should it do?" },
  { id: "context", label: "CONTEXT", emoji: "🌍", hint: "Who is it for and why?" },
  { id: "format", label: "FORMAT", emoji: "📐", hint: "How should the result look?" },
];

export function PromptMaster() {
  const auth = useAuth();
  const recordFn = useServerFn(recordGameResult);
  const [missionIndex, setMissionIndex] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Partial<Record<CardSlot, PuzzleComponentCard>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const mission = PROMPT_MISSIONS[missionIndex];
  const score = Object.values(selectedCards).reduce((total, card) => total + (card?.quality ?? 0), 0);
  const choose = (slot: CardSlot, card: PuzzleComponentCard) => {
    setSelectedCards((prev) => ({ ...prev, [slot]: card }));
    setSubmitted(false);
  };

  const reset = () => {
    setSelectedCards({});
    setSubmitted(false);
  };

  const submit = async () => {
    if (SLOTS.some((slot) => !selectedCards[slot.id])) {
      toast.error("Pick one card for each prompt part first!");
      return;
    }
    setSubmitted(true);
    if (auth.userId) {
      setSaving(true);
      try {
        const points = Math.min(60, Math.max(15, score * 5));
        const result = await recordFn({ data: { gameId: "prompt-master", mode: "solo", points, won: score >= 9 } });
        toast.success(`Prompt complete! +${result.awarded} points saved! 🎉`);
      } catch (error) {
        console.error(error);
        toast.error("Couldn't save points just now.");
      } finally {
        setSaving(false);
      }
    } else {
      toast.success("Prompt assembled! Sign in to save points to the leaderboard.");
    }
  };

  const fullPrompt = SLOTS.map((slot) => selectedCards[slot.id]?.text).filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current Mission</p><p className="font-display text-xl font-bold">{mission.title}</p></div>
        <div className="flex gap-2">{PROMPT_MISSIONS.map((m, i) => <button key={m.id} onClick={() => { setMissionIndex(i); reset(); }} className={cn("h-10 w-10 rounded-full border-2 font-bold", missionIndex === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted")}>{i + 1}</button>)}</div>
      </div>

      <div className="rounded-2xl bg-primary/5 p-4"><p className="text-sm font-bold">🧩 Your Challenge</p><p className="mt-1 text-sm text-muted-foreground">{mission.description}</p></div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SLOTS.map((slot) => (
          <section key={slot.id} className="rounded-2xl border bg-card p-4">
            <header className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-bold">{slot.emoji} {slot.label}</h3><span className="text-xs text-muted-foreground">{slot.hint}</span></header>
            <div className="space-y-2">
              {PUZZLE_SLOT_CARDS[slot.id].map((card) => {
                const active = selectedCards[slot.id]?.id === card.id;
                return <button key={card.id} type="button" onClick={() => choose(slot.id, card)} aria-pressed={active} className={cn("flex min-h-12 w-full items-center justify-between rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold transition", active ? "border-primary bg-primary/10" : "border-border hover:border-primary/60 hover:bg-muted/50")}><span>{card.label}</span><span aria-label={`${card.quality} quality stars`} className="shrink-0">{"⭐".repeat(card.quality)}</span></button>;
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-dashed bg-card/50 p-5">
        <div className="flex items-center justify-between"><h3 className="font-display text-lg font-bold">✨ Your assembled prompt</h3><span className="text-sm font-bold">{score} / 12 quality stars</span></div>
        {fullPrompt ? <p className="mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">{fullPrompt}</p> : <p className="mt-3 text-sm text-muted-foreground">Choose one card from each category to build your prompt.</p>}
        <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void submit()} disabled={saving}><Sparkles className="h-4 w-4" /> {saving ? "Saving…" : "Submit Prompt"}</Button><Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" /> Start over</Button><Button variant="ghost" onClick={() => { setMissionIndex((i) => (i + 1) % PROMPT_MISSIONS.length); reset(); }}>Next Mission <ArrowRight className="h-4 w-4" /></Button></div>
      </div>

      {submitted && <div className={cn("rounded-2xl border p-5", score >= 9 ? "border-fun-green bg-fun-green-soft" : "border-fun-amber bg-fun-amber-soft")}><p className="flex items-center gap-2 font-display text-xl font-bold">{score >= 9 ? <><CheckCircle2 className="h-6 w-6" /> Master prompt! Fantastic work!</> : <>Good start! Can you improve any cards to make it more specific?</>}</p><p className="mt-2 text-sm">You earned {score * 5} practice points. {score >= 9 ? "Your prompt has a clear role, task, context, and format. 🏆" : "Strong prompts tell AI exactly what to do and who it is for."}</p></div>}
    </div>
  );
}
