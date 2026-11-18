import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARENA_PAIRS, type ArenaPair } from "@/lib/games-data";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { recordGameResult } from "@/lib/learning.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROUND_SECONDS = 45;
const MAX_ROUNDS = 6;

export function WeakStrongArena() {
  const auth = useAuth();
  const recordFn = useServerFn(recordGameResult);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState<"A" | "B" | null>(null);
  const [saving, setSaving] = useState(false);
  const pair: ArenaPair = ARENA_PAIRS[round] ?? ARENA_PAIRS[0]!;

  const start = () => {
    setRound(0);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setAnswered(null);
    setFinished(false);
    setStarted(true);
  };

  const finish = async () => {
    if (finished) return;
    setFinished(true);
    setStarted(false);
    if (auth.userId) {
      setSaving(true);
      try {
        const finalPoints = Math.min(90, score);
        const result = await recordFn({ data: { gameId: "weak-strong-arena", mode: "solo", points: finalPoints, won: score >= 45 } });
        toast.success(`Arena complete! +${result.awarded} leaderboard points saved! 🏅`);
      } catch (error) {
        console.error(error);
        toast.error("Couldn't save arena points just now.");
      } finally {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          void finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  const answer = (choice: "A" | "B") => {
    if (answered) return;
    setAnswered(choice);
    const correct = choice === pair.stronger;
    if (correct) setScore((s) => s + pair.points);
    window.setTimeout(() => {
      if (round + 1 >= MAX_ROUNDS) void finish();
      else {
        setRound((r) => r + 1);
        setAnswered(null);
      }
    }, 1600);
  };

  const next = () => {
    if (round + 1 >= MAX_ROUNDS) void finish();
    else {
      setRound((r) => r + 1);
      setAnswered(null);
    }
  };

  const rightChoice = answered === pair.stronger;

  return (
    <div className="space-y-5">
      {!started && !finished ? (
        <div className="rounded-3xl border-2 border-dashed bg-card/50 p-10 text-center"><span className="text-5xl">⚔️</span><h3 className="mt-3 font-display text-2xl font-bold">Weak vs Strong Arena</h3><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">You have 45 seconds to choose the stronger prompt in each challenge. Spot the details that help AI understand!</p><Button size="lg" className="mt-6" onClick={start}>Enter the Arena <ArrowRight className="h-4 w-4" /></Button></div>
      ) : finished ? (
        <div className="space-y-4 rounded-3xl border bg-card p-8 text-center"><span className="text-5xl">🏆</span><h3 className="font-display text-3xl font-bold">Arena Complete!</h3><p className="text-xl font-bold">You scored {score} points</p><p className="text-sm text-muted-foreground">{score >= 60 ? "Prompt Champion! You can spot powerful prompts! 🌟" : "Keep practising the Prompt Formula: Topic + Audience + Details + Format."}</p>{!auth.userId && <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Sign in to save points to the leaderboard!</p>}<Button size="lg" onClick={start} disabled={saving}><RotateCcw className="h-4 w-4" /> {saving ? "Saving…" : "Play Again"}</Button></div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"><div><p className="text-xs font-bold uppercase text-muted-foreground">Round {round + 1} / {MAX_ROUNDS}</p><p className="font-display text-lg font-bold">{pair.task}</p></div><div className="flex gap-4 text-right"><div><p className="text-xs font-bold uppercase text-muted-foreground">Time</p><p className={cn("font-display text-xl font-bold", timeLeft <= 10 ? "text-red-500" : "")}>{timeLeft}s</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Score</p><p className="font-display text-xl font-bold text-primary">{score}</p></div></div></div>
          <p className="text-center text-sm font-semibold">Which prompt is stronger? Select A or B.</p>
          <div className="grid gap-4 md:grid-cols-2">{(["A", "B"] as const).map((choice) => { const text = choice === "A" ? pair.promptA : pair.promptB; const isSelected = answered === choice; const isCorrect = choice === pair.stronger; const reveal = answered !== null; return <button key={choice} type="button" disabled={answered !== null} onClick={() => answer(choice)} className={cn("min-h-40 rounded-2xl border-2 bg-card p-5 text-left transition hover:border-primary hover:shadow-md disabled:cursor-default", reveal && isSelected && (isCorrect ? "border-fun-green bg-fun-green-soft" : "border-red-400 bg-red-50"), reveal && isCorrect && "border-fun-green")}><span className="mb-3 inline-grid h-9 w-9 place-items-center rounded-full bg-muted font-display font-bold">{choice}</span><p className="text-base font-semibold leading-relaxed">{text}</p>{reveal && isCorrect && <span className="mt-3 flex items-center gap-2 text-sm font-bold text-fun-green"><CheckCircle2 className="h-4 w-4" /> Stronger prompt (+{pair.points})</span>}{reveal && isSelected && !isCorrect && <span className="mt-3 flex items-center gap-2 text-sm font-bold text-red-600"><XCircle className="h-4 w-4" /> Not quite</span>}</button>; })}</div>
          {answered && <div className="rounded-2xl border bg-primary/5 p-4"><p className="text-sm font-semibold">{pair.reason}</p><Button className="mt-3" size="sm" onClick={next}>Next challenge <ArrowRight className="h-4 w-4" /></Button></div>}
        </div>
      )}
    </div>
  );
}
