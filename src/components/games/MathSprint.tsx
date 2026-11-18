import { useEffect, useRef, useState } from "react";
import { Clock, Play, RotateCcw, Trophy, Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRandomMathQuestions, type MathQuestion } from "@/lib/games-data";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { recordGameResult } from "@/lib/learning.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

async function celebrate() {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
}

export type GameMode = "solo" | "vs-bot" | "two-player";
export type BotDifficulty = "easy" | "medium" | "master";

export function MathSprint() {
  const auth = useAuth();
  const recordFn = useServerFn(recordGameResult);

  const [mode, setMode] = useState<GameMode>("solo");
  const [botDiff, setBotDiff] = useState<BotDifficulty>("medium");
  const [gameState, setGameState] = useState<"ready" | "playing" | "p2-turn" | "finished">("ready");
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [p2Streak, setP2Streak] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [botLog, setBotLog] = useState("Pixel Bot is ready! 🤖");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFinishingRef = useRef(false);

  const startGame = (chosenMode = mode) => {
    setMode(chosenMode);
    setQuestions(getRandomMathQuestions(20));
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setP2Score(0);
    setP2Streak(0);
    setBotScore(0);
    setFeedback(null);
    setTimeLeft(40);
    setGameState("playing");
    setBotLog("Pixel Bot is warming up calculations! ⚡");
    isFinishingRef.current = false;
  };

  const endGame = async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setGameState("finished");
    await celebrate();
    if (auth.userId) {
      setSaving(true);
      try {
        const finalPts = Math.min(100, Math.max(10, Math.floor(score * 1.2)));
        const won = mode === "vs-bot" ? score >= botScore : true;
        const result = await recordFn({ data: { gameId: "math-sprint", mode, points: finalPts, won } });
        toast.success(`Game complete! +${result.awarded} leaderboard points saved! 🏅`);
      } catch (error) {
        console.error(error);
        toast.error("Couldn't save your points. Please try again later.");
      } finally {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    if (gameState !== "playing" && gameState !== "p2-turn") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (mode === "two-player" && gameState === "playing") {
            setGameState("p2-turn");
            setQuestions(getRandomMathQuestions(20));
            setQIndex(0);
            setFeedback(null);
            return 40;
          }
          void endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode]);

  useEffect(() => {
    if (gameState !== "playing" || mode !== "vs-bot") {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      return;
    }
    const intervalMs = botDiff === "easy" ? 4500 : botDiff === "medium" ? 3200 : 2200;
    const accuracy = botDiff === "easy" ? 0.65 : botDiff === "medium" ? 0.8 : 0.95;
    botIntervalRef.current = setInterval(() => {
      if (Math.random() < accuracy) {
        setBotScore((b) => b + 10);
        setBotLog("🤖 Pixel Bot: Got it right! (+10)");
      } else {
        setBotLog("🤖 Pixel Bot: Oops, miscalculated! 😅");
      }
    }, intervalMs);
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [gameState, mode, botDiff]);

  const currentQ = questions[qIndex] ?? questions[0];
  const handleAnswer = (optionIdx: number) => {
    if (!currentQ || (gameState !== "playing" && gameState !== "p2-turn")) return;
    const isCorrect = optionIdx === currentQ.correctIndex;
    const isP2 = gameState === "p2-turn";
    if (isCorrect) {
      const points = 10 + (isP2 ? p2Streak : streak) * 2;
      if (isP2) {
        setP2Score((s) => s + points);
        setP2Streak((s) => s + 1);
      } else {
        setScore((s) => s + points);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      }
      setFeedback({ correct: true, message: `Correct! +${points} pts 🔥` });
    } else {
      if (isP2) setP2Streak(0);
      else setStreak(0);
      setFeedback({ correct: false, message: `Oops! ${currentQ.explanation}` });
    }
    if (qIndex + 1 < questions.length) setQIndex((i) => i + 1);
    else {
      setQuestions(getRandomMathQuestions(20));
      setQIndex(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card/60 p-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={mode === "solo" ? "default" : "outline"} onClick={() => { setMode("solo"); setGameState("ready"); }}><Clock className="h-4 w-4" /> Solo Sprint</Button>
          <Button size="sm" variant={mode === "vs-bot" ? "default" : "outline"} onClick={() => { setMode("vs-bot"); setGameState("ready"); }}><Bot className="h-4 w-4" /> Vs Pixel Bot</Button>
          <Button size="sm" variant={mode === "two-player" ? "default" : "outline"} onClick={() => { setMode("two-player"); setGameState("ready"); }}><Users className="h-4 w-4" /> 2-Player Pass & Play</Button>
        </div>
        {mode === "vs-bot" && <div className="flex items-center gap-1.5 text-xs font-bold"><span className="text-muted-foreground">Bot Difficulty:</span>{(["easy", "medium", "master"] as const).map((d) => <button key={d} type="button" onClick={() => setBotDiff(d)} className={cn("rounded-lg px-2.5 py-1 capitalize transition", botDiff === d ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>{d}</button>)}</div>}
      </div>

      {gameState === "ready" ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-card/40 p-10 text-center">
          <span className="mb-3 text-5xl">⚡</span><h3 className="font-display text-2xl font-bold">Class 4C Math Sprint</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{mode === "solo" ? "Solve mental math and estimation puzzles against the 40-second clock. Build combos for bonus points!" : mode === "vs-bot" ? `Challenge Pixel Bot (${botDiff} level) in a math sprint!` : "Player 1 takes 40 seconds, then Player 2 takes 40 seconds on the same device."}</p>
          <Button size="lg" className="mt-6 rounded-full px-8 font-bold" onClick={() => startGame()}><Play className="h-5 w-5" /> Start Math Sprint</Button>
        </div>
      ) : gameState === "playing" || gameState === "p2-turn" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border bg-card p-3 text-center"><span className="text-xs font-bold uppercase text-muted-foreground">{gameState === "p2-turn" ? "Player 2 Score" : mode === "two-player" ? "Player 1 Score" : "My Score"}</span><p className="font-display text-2xl font-bold text-primary">{gameState === "p2-turn" ? p2Score : score}</p></div>
            {mode === "vs-bot" && <div className="rounded-2xl border bg-card p-3 text-center"><span className="text-xs font-bold uppercase text-muted-foreground">🤖 Pixel Bot</span><p className="font-display text-2xl font-bold text-fun-pink">{botScore}</p></div>}
            {mode === "two-player" && <div className="rounded-2xl border bg-card p-3 text-center"><span className="text-xs font-bold uppercase text-muted-foreground">Active Turn</span><p className="font-display text-lg font-bold text-fun-amber">{gameState === "p2-turn" ? "Player 2 🎮" : "Player 1 🎮"}</p></div>}
            <div className="rounded-2xl border bg-card p-3 text-center"><span className="text-xs font-bold uppercase text-muted-foreground">Time Left</span><p className={cn("font-display text-2xl font-bold", timeLeft <= 10 ? "text-red-500 animate-pulse" : "")}>{timeLeft}s</p></div>
            <div className="rounded-2xl border bg-card p-3 text-center"><span className="text-xs font-bold uppercase text-muted-foreground">Streak 🔥</span><p className="font-display text-2xl font-bold text-fun-green">{gameState === "p2-turn" ? p2Streak : streak}</p></div>
          </div>
          {mode === "vs-bot" && <div className="rounded-xl bg-fun-pink-soft px-4 py-2 text-xs font-semibold text-fun-pink-ink">{botLog}</div>}
          {currentQ && <div className="card-fun p-6 sm:p-8"><div className="flex items-center justify-between text-xs font-bold text-muted-foreground"><span className="rounded-full bg-muted px-2.5 py-1">{currentQ.category}</span><span>Question {qIndex + 1}</span></div><h4 className="mt-4 text-center font-display text-2xl font-bold sm:text-3xl">{currentQ.question}</h4><div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">{currentQ.options.map((opt, i) => <button key={`${currentQ.id}-${opt}`} type="button" onClick={() => handleAnswer(i)} className="flex min-h-14 items-center justify-center rounded-2xl border-2 bg-card px-4 text-lg font-bold transition hover:border-primary hover:bg-primary/5 active:scale-95">{opt}</button>)}</div>{feedback && <p className={cn("mt-4 text-center text-sm font-bold", feedback.correct ? "text-fun-green" : "text-amber-500")}>{feedback.message}</p>}</div>}
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border bg-card p-8 text-center"><Trophy className="mx-auto h-16 w-16 text-fun-amber" /><h3 className="font-display text-3xl font-bold">Sprint Complete!</h3>{mode === "vs-bot" ? <><p className="text-xl font-bold">{score > botScore ? "🎉 You defeated Pixel Bot!" : score === botScore ? "🤝 It's a tie with Pixel Bot!" : "🤖 Pixel Bot won this round! Practise and try again!"}</p><p className="text-sm text-muted-foreground">You: {score} pts · Pixel Bot: {botScore} pts</p></> : mode === "two-player" ? <><p className="text-xl font-bold">{score > p2Score ? "👑 Player 1 takes the crown!" : p2Score > score ? "👑 Player 2 takes the crown!" : "🤝 Perfect tie!"}</p><p className="text-sm text-muted-foreground">Player 1: {score} pts · Player 2: {p2Score} pts</p></> : <><p className="text-xl font-bold">Final Score: {score} Points</p><p className="text-sm text-muted-foreground">Best Streak: {bestStreak} in a row 🔥</p></>}{!auth.userId && <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">💡 Sign in to save game points to /rankings!</p>}<Button size="lg" onClick={() => startGame()} disabled={saving}><RotateCcw className="h-4 w-4" /> {saving ? "Saving score…" : "Play Again"}</Button></div>
      )}
    </div>
  );
}
