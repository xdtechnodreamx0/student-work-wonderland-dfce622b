import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Lock, Printer } from "lucide-react";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { Button } from "@/components/ui/button";
import { Progress as Bar } from "@/components/ui/progress";
import { CertificateCard } from "@/components/learn/Certificate";
import { useProgress } from "@/hooks/use-progress";
import { LEVELS, isChallengeOpen, isLevelUnlocked, pathPercent, type Level } from "@/lib/learning-data";
import { completeLesson, submitChallenge, type Certificate } from "@/lib/learning.functions";
import { tierLabel, type OwnedEmoji } from "@/lib/luck";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  head: () => pageMeta("Learning Path", "Five levels from Beginner to Professional. Finish lessons, pass challenges, earn certificates and lucky emojis."),
  component: Learn,
});

const RING: Record<Level["color"], string> = { green: "border-fun-green", blue: "border-primary", amber: "border-fun-amber", purple: "border-fun-purple", pink: "border-fun-pink" };

function Learn() {
  const prog = useProgress();
  const p = prog.data;
  const done = p?.done_lessons ?? [];
  const passed = p?.passed_levels ?? [];
  const [active, setActive] = useState(LEVELS[0]!.id);
  const [reward, setReward] = useState<{ drawn: OwnedEmoji; certificate: Certificate | null; correct: number; total: number; passed: boolean } | null>(null);
  const level = LEVELS.find((l) => l.id === active)!;
  const pct = pathPercent(done, passed);

  return (
    <>
      <PageHeader eyebrow="🎓 Learning Path" emoji="🗺️" title="From Beginner to Professional" intro="Read each lesson, tap Done, then take the level challenge. Pass to earn a certificate, more luck and a surprise emoji!" />
      <Section>
        <div className="mx-auto max-w-5xl space-y-8">
          {!prog.signedIn ? (
            <div className="rounded-3xl border bg-fun-amber/10 p-5 text-center">
              <p className="font-semibold">You can read every lesson now. <Link to="/auth" search={{ redirect: "/learn" }} className="underline">Sign in</Link> to save progress, take challenges and earn certificates. 🏅</p>
            </div>
          ) : (
            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-lg font-bold">Your path: {pct}% done</p>
                <p className="text-sm font-semibold">🍀 Luck {p?.luck ?? 0} · ⭐ Score {p?.score ?? 0} · {p?.top_emoji ?? "🌱"} top emoji</p>
              </div>
              <Bar value={pct} className="mt-3 h-3" aria-label="Path progress" />
            </div>
          )}

          <ol className="grid gap-3 sm:grid-cols-5" aria-label="Levels">
            {LEVELS.map((l, i) => {
              const open = isLevelUnlocked(l.id, passed) || !prog.signedIn;
              const isPassed = passed.includes(l.id);
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setActive(l.id)}
                    aria-current={active === l.id}
                    className={cn("flex w-full flex-col items-center gap-1 rounded-2xl border-4 bg-card p-3 text-center transition hover:-translate-y-0.5", active === l.id ? RING[l.color] : "border-transparent", !open && "opacity-60")}
                  >
                    <span className="text-3xl" aria-hidden="true">{isPassed ? "✅" : open ? l.emoji : "🔒"}</span>
                    <span className="text-xs font-bold text-muted-foreground">Level {i + 1}</span>
                    <span className="font-display font-bold">{l.name}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <LevelView key={level.id} level={level} />
        </div>
      </Section>
      {reward && <RewardDialog r={reward} onClose={() => setReward(null)} />}
    </>
  );

  function LevelView({ level }: { level: Level }) {
    const qc = useQueryClient();
    const lessonFn = useServerFn(completeLesson);
    const challengeFn = useServerFn(submitChallenge);
    const [answers, setAnswers] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);
    const unlocked = isLevelUnlocked(level.id, passed);
    const challengeOpen = prog.signedIn && unlocked && isChallengeOpen(level, done);

    const markDone = async (id: string) => {
      setBusy(true);
      try {
        const np = await lessonFn({ data: { lessonId: id } });
        prog.set(np);
        toast.success("Lesson done! +5 score, +2 luck 🍀");
      } catch (e) { toast.error(e instanceof Error ? e.message : "Try again"); } finally { setBusy(false); }
    };
    const submit = async () => {
      setBusy(true);
      try {
        const r = await challengeFn({ data: { levelId: level.id, answers } });
        prog.set(r.progress);
        qc.invalidateQueries({ queryKey: ["rankings"] });
        setReward({ drawn: r.drawn, certificate: r.certificate, ...r.result });
        setAnswers([]);
      } catch (e) { toast.error(e instanceof Error ? e.message : "Try again"); } finally { setBusy(false); }
    };

    return (
      <Reveal>
        <section aria-labelledby="lvl-title" className="space-y-6">
          <div>
            <h2 id="lvl-title" className="font-display text-2xl font-bold">{level.emoji} {level.name}</h2>
            <p className="text-muted-foreground">{level.intro}</p>
            {prog.signedIn && !unlocked && <p className="mt-2 flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> Pass the level before this one to unlock its challenge.</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {level.lessons.map((ls) => {
              const isDone = done.includes(ls.id);
              return (
                <article key={ls.id} className={cn("flex flex-col gap-2 rounded-3xl border bg-card p-5 shadow-sm", isDone && "ring-2 ring-fun-green")}>
                  <p className="text-3xl" aria-hidden="true">{ls.emoji}</p>
                  <h3 className="font-display text-lg font-bold">{ls.title}</h3>
                  <ul className="list-disc space-y-1 pl-5 text-[0.97rem]">{ls.body.map((b) => <li key={b}>{b}</li>)}</ul>
                  <p className="rounded-xl bg-muted p-3 text-sm"><strong>Try it:</strong> {ls.tryIt}</p>
                  {prog.signedIn && (
                    <Button className="mt-auto" variant={isDone ? "secondary" : "default"} disabled={isDone || busy || !unlocked} onClick={() => markDone(ls.id)}>
                      {isDone ? <><Check /> Done</> : "Mark as done"}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold">🏁 {level.name} challenge</h3>
            {!challengeOpen ? (
              <p className="mt-2 text-muted-foreground">{prog.signedIn ? "Finish every lesson above to open the challenge." : "Sign in to take the challenge."}</p>
            ) : (
              <div className="mt-4 space-y-5">
                {level.challenge.map((q, qi) => (
                  <fieldset key={q.q} className="space-y-2">
                    <legend className="font-semibold">{qi + 1}. {q.q}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((o, oi) => (
                        <button key={o} type="button" aria-pressed={answers[qi] === oi}
                          onClick={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })}
                          className={cn("min-h-11 rounded-xl border-2 px-3 py-2 text-left transition", answers[qi] === oi ? "border-primary bg-primary/10 font-semibold" : "border-border hover:bg-muted")}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <Button size="lg" disabled={busy || level.challenge.some((_, i) => answers[i] === undefined)} onClick={submit}>
                  {passed.includes(level.id) ? "Try again for more luck 🍀" : "Submit challenge"}
                </Button>
              </div>
            )}
          </div>
        </section>
      </Reveal>
    );
  }
}

function RewardDialog({ r, onClose }: { r: { drawn: OwnedEmoji; certificate: Certificate | null; correct: number; total: number; passed: boolean }; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Challenge result" className="fixed inset-0 z-[80] grid place-items-center bg-foreground/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg space-y-4 rounded-3xl bg-card p-6 text-center shadow-lift animate-pop" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-2xl font-bold">{r.passed ? "You passed! 🎉" : "Good try! 💪"}</p>
        <p>{r.correct} of {r.total} correct.</p>
        <div className="rounded-2xl bg-muted p-4">
          <p className="text-sm font-semibold">Your luck draw gave you…</p>
          <p className="text-6xl" aria-hidden="true">{r.drawn.emoji}</p>
          <p className="font-bold">{tierLabel(r.drawn.rank)} emoji!</p>
        </div>
        {r.certificate && <div className="space-y-2"><CertificateCard c={r.certificate} /><Button variant="outline" onClick={() => window.print()}><Printer /> Print certificate</Button></div>}
        <Button onClick={onClose} autoFocus>Keep going</Button>
      </div>
    </div>
  );
}
