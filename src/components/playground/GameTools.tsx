import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DOCTOR_PROMPTS, TEST_CHECKLIST } from "@/lib/club-data";
import { FORMULA, cheer, scorePrompt } from "@/lib/prompt-doctor";
import { useLocalState } from "@/lib/local-store";
import { cn } from "@/lib/utils";

async function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  window.setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 200);
  window.setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 350);
}

/* ---------------- Tool 4: Prompt Doctor ---------------- */
export function PromptDoctor() {
  const [patient, setPatient] = useState(0);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<ReturnType<typeof scorePrompt> | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <p className="font-bold">🩺 Pick a sick prompt to fix:</p>
        <div className="flex flex-wrap gap-2">
          {DOCTOR_PROMPTS.map((p, i) => (
            <button
              key={p}
              type="button"
              aria-pressed={patient === i}
              onClick={() => {
                setPatient(i);
                setChecked(null);
              }}
              className={cn("min-h-11 rounded-full border-2 px-4 font-bold", patient === i ? "border-fun-pink bg-fun-pink-soft text-fun-pink-ink" : "hover:border-fun-pink")}
            >
              {p}
            </button>
          ))}
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const r = scorePrompt(text);
            setChecked(r);
            if (r.stars === 6) celebrate();
          }}
        >
          <label htmlFor="doctor" className="block font-bold">
            Make “{DOCTOR_PROMPTS[patient]}” strong:
          </label>
          <textarea
            id="doctor"
            maxLength={300}
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Make a colourful timetable for class 4 students with Monday to Friday and a picture for each subject…"
            className="w-full rounded-2xl border-2 bg-background p-4 text-base outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length}/300 · nothing is saved or sent</span>
            <Button type="submit" variant="hero" disabled={!text.trim()}>
              Check my prompt 🩺
            </Button>
          </div>
        </form>
      </div>
      <div className="rounded-3xl bg-muted p-6" aria-live="polite">
        {!checked ? (
          <p className="text-muted-foreground">Write your better prompt and press “Check my prompt”. Dr. Pixel will give you up to 6 stars! ⭐</p>
        ) : (
          <div className="space-y-4">
            <p className="text-3xl tracking-widest" aria-label={`${checked.stars} out of 6 stars`}>
              {"⭐".repeat(checked.stars)}
              <span className="opacity-25">{"⭐".repeat(6 - checked.stars)}</span>
            </p>
            <p className="font-display text-xl font-semibold">{cheer(checked.stars)}</p>
            <ul className="space-y-2">
              {FORMULA.map((f) => {
                const has = checked.found.includes(f.id);
                return (
                  <li key={f.id} className={cn("rounded-xl px-4 py-2", has ? "bg-fun-green-soft text-fun-green-ink" : "bg-card")}>
                    <strong>
                      {has ? "✅" : f.emoji} {f.label}
                    </strong>
                    {!has && <span className="block text-sm text-muted-foreground">{f.tip}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Tool 5: Test Checklist ---------------- */
export function TestChecklist() {
  const [ticks, setTicks] = useLocalState<string[]>("checklist", []);
  const all = TEST_CHECKLIST.every((t) => ticks.includes(t));
  const prev = useRef(all);
  useEffect(() => {
    if (all && !prev.current) celebrate();
    prev.current = all;
  }, [all]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="text-center text-muted-foreground">Testing a website like a designer? Tick each thing you checked.</p>
      <ul className="space-y-3">
        {TEST_CHECKLIST.map((t) => {
          const on = ticks.includes(t);
          return (
            <li key={t}>
              <label className={cn("flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border-2 px-5 text-lg font-bold transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring", on ? "border-fun-green bg-fun-green-soft text-fun-green-ink" : "bg-card hover:border-primary")}>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => setTicks(on ? ticks.filter((x) => x !== t) : [...ticks, t])} />
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg border-2 text-base", on ? "animate-pop border-fun-green bg-fun-green" : "border-border")} aria-hidden="true">
                  {on ? "✔" : ""}
                </span>
                {t}
              </label>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className={cn("rounded-2xl p-4 text-center font-display text-2xl font-semibold", all ? "animate-pop bg-sunny" : "sr-only")}>
        {all ? "You're ready to test your site! 🎉" : ""}
      </p>
      {ticks.length > 0 && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => setTicks([])}>
            <RotateCcw /> Reset
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Tool 6: AI Says! ---------------- */
const ACTIONS = [
  { id: "picture", label: "Add a picture", emoji: "🖼️" },
  { id: "home", label: "Add a Home button", emoji: "🏠" },
  { id: "blue", label: "Make it blue", emoji: "🔵" },
  { id: "title", label: "Add a title", emoji: "✍️" },
] as const;
type ActionId = (typeof ACTIONS)[number]["id"];
const ROUNDS = 10;
const SPEEDS = [
  { id: "relaxed", label: "🐢 Relaxed", seconds: 10 },
  { id: "quick", label: "🐇 Quick", seconds: 5 },
] as const;

type Round = { action: ActionId; aiSays: boolean };
function newRound(): Round {
  return { action: (ACTIONS[Math.floor(Math.random() * ACTIONS.length)] ?? ACTIONS[0]).id, aiSays: Math.random() < 0.7 };
}

export function AISays() {
  const [state, setState] = useState<"idle" | "play" | "pause" | "done">("idle");
  const [round, setRound] = useState<Round>(newRound);
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]["id"]>("relaxed");
  const TIME = (SPEEDS.find((x) => x.id === speed) ?? SPEEDS[0]).seconds;
  const [left, setLeft] = useState<number>(SPEEDS[0].seconds);
  const [feedback, setFeedback] = useState("");
  const locked = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const pending = useRef<(() => void) | null>(null);

  const next = (gained: boolean, msg: string) => {
    locked.current = true;
    if (gained) setScore((s) => s + 1);
    setFeedback(msg);
    const advance = () => {
      locked.current = false;
      if (n + 1 >= ROUNDS) {
        setState("done");
        return;
      }
      setN((x) => x + 1);
      setRound(newRound());
      setLeft(TIME);
      setFeedback("");
    };
    // If the game is paused while feedback shows, wait until Resume.
    window.setTimeout(() => {
      if (stateRef.current === "pause") pending.current = advance;
      else advance();
    }, 1200);
  };

  useEffect(() => {
    if (state !== "play" || locked.current) return;
    if (left <= 0) {
      if (round.aiSays) next(false, "⏰ Time's up! Let's try the next one.");
      else next(true, "🙌 Great! AI didn't say — you didn't tap!");
      return;
    }
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, left, round]);

  const tap = (id: ActionId) => {
    if (state !== "play" || locked.current) return;
    if (!round.aiSays) return next(false, "😄 Oops! AI didn't say! Only tap when you hear “AI says”.");
    if (id === round.action) return next(true, "🎉 Correct! Great listening!");
    return next(false, "🤔 Not quite — that was a different button. Keep going!");
  };

  const start = () => {
    setScore(0);
    setN(0);
    setRound(newRound());
    setLeft(TIME);
    setFeedback("");
    locked.current = false;
    pending.current = null;
    setState("play");
  };

  const togglePause = () => {
    if (state === "play") return setState("pause");
    setState("play");
    const go = pending.current;
    pending.current = null;
    go?.();
  };

  const action = ACTIONS.find((a) => a.id === round.action) ?? ACTIONS[0];
  const say = `${round.aiSays ? "AI says " : ""}${action.label.toLowerCase()}!`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      {state === "idle" && (
        <div className="space-y-4">
          <p className="text-lg">Like Simon Says! Tap the matching button <strong>only</strong> when the instruction starts with “AI says”. If it doesn't — don't tap!</p>
          <div role="group" aria-label="Game speed" className="flex justify-center gap-2">
            {SPEEDS.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={speed === x.id}
                onClick={() => setSpeed(x.id)}
                className={`min-h-11 rounded-full border-2 px-4 font-bold ${speed === x.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
              >
                {x.label} · {x.seconds}s
              </button>
            ))}
          </div>
          <Button variant="hero" size="lg" onClick={start}>
            <Play /> Start game
          </Button>
        </div>
      )}

      {(state === "play" || state === "pause") && (
        <>
          <div className="flex items-center justify-between font-bold">
            <span>
              Round {n + 1} / {ROUNDS}
            </span>
            <span>⭐ {score}</span>
            <Button variant="ghost" size="sm" onClick={togglePause}>
              {state === "play" ? (
                <>
                  <Pause /> Pause
                </>
              ) : (
                <>
                  <Play /> Resume
                </>
              )}
            </Button>
          </div>
          <div className="rounded-3xl bg-brand p-8 text-primary-foreground" aria-live="assertive">
            <p className="font-display text-3xl font-bold sm:text-4xl" key={`${n}-${say}`}>
              {state === "pause" ? "⏸️ Paused" : `“${say.charAt(0).toUpperCase() + say.slice(1)}”`}
            </p>
            <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-card/30">
              <div className="h-full bg-fun-amber transition-[width] duration-1000 ease-linear" style={{ width: `${(left / TIME) * 100}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => tap(a.id)}
                disabled={state !== "play"}
                className="card-fun lift min-h-24 p-4 text-lg font-bold active:scale-95 disabled:opacity-50"
              >
                <span className="block text-4xl" aria-hidden="true">
                  {a.emoji}
                </span>
                {a.label}
              </button>
            ))}
          </div>
          <p className="min-h-8 text-lg font-bold" aria-live="polite">
            {feedback}
          </p>
        </>
      )}

      {state === "done" && (
        <div className="animate-pop space-y-4 rounded-3xl bg-sunny p-8">
          <p className="font-display text-4xl font-bold">
            ⭐ {score} / {ROUNDS}
          </p>
          <p className="text-lg font-semibold">{score >= 8 ? "Amazing listening skills, explorer! 🏆" : score >= 5 ? "Great job! Play again to beat your score! 💪" : "Good try! Every round makes you better. 😊"}</p>
          <Button variant="hero" onClick={start}>
            <RotateCcw /> Play again
          </Button>
        </div>
      )}
    </div>
  );
}
