import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Check, ChevronDown, Lightbulb, Package } from "lucide-react";
import { ACHIEVEMENTS, DAYS, TAGS, type Day, type DayTag } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { useLocalState } from "@/lib/local-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { clubContentQuery } from "@/lib/club-content";
import { mergeDays, type MergedDay } from "@/lib/club-merge";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FUN } from "@/components/club/Art";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  head: () => pageMeta("The 12-day journey", "Day by day: websites, AI, paper blueprints, prompts, Lovable, testing and the big Website Showcase."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: Journey,
});

const FILTERS: { id: "all" | DayTag; label: string }[] = [
  { id: "all", label: "All days" },
  { id: "explore", label: "🧭 Explore" },
  { id: "paper", label: "✏️ Paper" },
  { id: "prompt", label: "💬 Prompt" },
  { id: "computer", label: "💻 Computer" },
  { id: "test", label: "✅ Test" },
  { id: "showcase", label: "🌟 Showcase" },
];

function Journey() {
  const [filter, setFilter] = useState<"all" | DayTag>("all");
  const [read, setRead] = useLocalState<number[]>("days_read", []);
  const { data } = useSuspenseQuery(clubContentQuery);
  const allDays = mergeDays(DAYS, data.dayNotes);
  const days = allDays.filter((d) => filter === "all" || (d.tag === filter && !d.placeholder));
  const toggle = (n: number) => setRead((r) => (r.includes(n) ? r.filter((x) => x !== n) : [...r, n]));
  const showBanner = filter === "all";
  const bannerAfter = days.findIndex((d) => d.n === 3) + 1;
  const realDays = allDays.filter((d) => !d.placeholder).length;
  const readCount = read.filter((n) => allDays.some((d) => d.n === n && !d.placeholder)).length;

  return (
    <>
      <PageHeader
        eyebrow="🗺️ The journey"
        emoji="🚀"
        title="12 days of paper, prompts & pixels"
        intro="Tap a day to see what we did, the materials, homework and a mini-quiz. Tick “I've read this” to track your progress!"
      />

      <Section>
        <div className="mx-auto max-w-5xl">
          <div className="card-fun sticky top-20 z-20 mb-10 space-y-4 p-4">
            <div role="group" aria-label="Filter days by type" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-bold transition",
                    filter === f.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-sm font-bold text-muted-foreground">
                Read {readCount} / {realDays}
              </span>
              <Progress value={(readCount / realDays) * 100} className="h-3" aria-label="Days read" />
              {readCount === realDays && <span className="animate-pop text-xl">🎉</span>}
            </div>
          </div>

          
          <svg className="pointer-events-none absolute inset-0 hidden h-full w-full stroke-primary/20 md:block" fill="none" strokeWidth="3" strokeDasharray="6 6" aria-hidden="true">
            <path d="M 50% 0 Q 52% 25%, 50% 50% T 50% 100%" />
          </svg>

          <ol className="relative space-y-8 md:grid md:grid-cols-2 md:gap-x-24 md:gap-y-8 md:space-y-0 before:absolute before:bottom-0 before:left-5 before:top-0 before:w-1 before:rounded-full before:bg-brand before:opacity-30 md:before:left-1/2 md:before:-translate-x-1/2">
            {days.map((d, i) => {
              const banner = showBanner && d.n === 3;
              const offset = showBanner && i >= bannerAfter ? 2 : 0;
              return [
              <li
                key={d.n}
                style={{ "--row": `${i + 1 + offset} / span 2` } as React.CSSProperties}
                className={cn("relative pl-14 md:pl-0 md:[grid-row:var(--row)]", i % 2 === 0 ? "md:col-start-1" : "md:col-start-2")}
              >
                <span
                  className={cn(
                    "absolute left-0 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border-4 border-background font-display text-lg font-bold shadow",
                    read.includes(d.n) ? "bg-fun-green text-foreground" : "bg-primary text-primary-foreground",
                    i % 2 === 0 ? "md:left-auto md:-right-[70px]" : "md:-left-[70px]",
                  )}
                  aria-hidden="true"
                >
                  {read.includes(d.n) ? "✓" : d.n}
                </span>
                <Reveal>
                  <DayCard day={d} read={read.includes(d.n)} onToggle={() => toggle(d.n)} />
                </Reveal>
              </li>,
              banner && (
                <li
                  key="achievements"
                  style={{ "--row": `${i + 3} / span 1` } as React.CSSProperties}
                  className="relative z-10 md:col-span-2 md:[grid-row:var(--row)]"
                >
                  <Reveal>
                    <AchievementBanner />
                  </Reveal>
                </li>
              ),
              ];
            })}
          </ol>
        </div>
      </Section>
    </>
  );
}

function AchievementBanner() {
  return (
    <section aria-labelledby="achievements-title" className="rounded-3xl border-2 border-fun-amber bg-fun-amber-soft p-6 text-center shadow-lift">
      <h2 id="achievements-title" className="text-2xl font-bold text-fun-amber-ink">
        <span aria-hidden="true">🏅</span> Club achievement
      </h2>
      <p className="mt-1 font-semibold">By the end of the first three days, students will…</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.text} className="rounded-full bg-card px-4 py-2 text-sm font-bold">
            <span aria-hidden="true">{a.emoji}</span> {a.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DayCard({ day, read, onToggle }: { day: MergedDay; read: boolean; onToggle: () => void }) {
  const tag = TAGS[day.tag];
  const c = FUN[tag.color];
  if (day.placeholder) {
    return (
      <article className="dashed-paper rounded-2xl p-6" aria-labelledby={`day-${day.n}`}>
        <p className="text-sm font-bold text-muted-foreground">Day {day.n}</p>
        <h2 id={`day-${day.n}`} className="text-2xl font-bold">
          Day {day.n}: {day.title}
        </h2>
        <p className="mt-2 text-muted-foreground">{day.objective}</p>
      </article>
    );
  }
  return (
    <article className="card-fun lift overflow-hidden" aria-labelledby={`day-${day.n}`}>
      <div className={cn("h-2", c.solid)} aria-hidden="true" />
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">Day {day.n}</span>
          <span className={cn("rounded-full px-3 py-0.5 text-sm font-bold", c.soft, c.ink)}>
            <span aria-hidden="true">{tag.emoji}</span> {tag.label}
          </span>
        </div>
        <h2 id={`day-${day.n}`} className="mt-2 text-2xl font-bold">
          {day.title}
        </h2>
        {day.objective && (
          <p className="mt-2 rounded-xl bg-muted px-4 py-2 text-[0.98rem]">
            <strong>🎯 Goal:</strong> {day.objective}
          </p>
        )}
        <h3 className="mt-4 font-sans text-sm font-extrabold uppercase tracking-wide text-muted-foreground">What we did</h3>
        <ul className="mt-2 space-y-1.5">
          {day.did.map((x) => (
            <li key={x} className="flex gap-2">
              <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", c.solid)} aria-hidden="true" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
        {day.teacherNotes && day.teacherNotes.length > 0 && (
          <div className="mt-4 rounded-xl bg-fun-amber-soft px-4 py-3 text-fun-amber-ink">
            <p className="font-bold">📝 Notes from our teacher</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {day.teacherNotes.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {day.materials && (
            <Fold icon={<Package className="h-4 w-4" />} label="Materials">
              <ul className="flex flex-wrap gap-2">
                {day.materials.map((m) => (
                  <li key={m} className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                    {m}
                  </li>
                ))}
              </ul>
            </Fold>
          )}
          {day.homework && (
            <Fold icon={<BookOpen className="h-4 w-4" />} label="Homework">
              <p>{day.homework}</p>
            </Fold>
          )}
          {day.learn && (
            <Fold icon={<span aria-hidden="true">🧠</span>} label="What we learned">
              <dl className="space-y-3">
                {day.learn.map((x) => (
                  <div key={x.q}>
                    <dt className="font-bold">{x.q}</dt>
                    <dd className="text-muted-foreground">{x.a}</dd>
                  </div>
                ))}
              </dl>
            </Fold>
          )}
          {day.quiz && (
            <Fold icon={<Lightbulb className="h-4 w-4" />} label="Fun fact & mini-quiz">
              <Quiz day={day} />
            </Fold>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={read}
          className={cn(
            "mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-bold transition",
            read ? "border-fun-green bg-fun-green-soft text-fun-green-ink" : "border-border hover:border-primary hover:text-primary",
          )}
        >
          <Check className="h-4 w-4" /> {read ? "Read it!" : "I've read this"}
        </button>
      </div>
    </article>
  );
}

function Fold({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border bg-background">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 font-bold [&::-webkit-details-marker]:hidden">
        {icon} {label}
        <ChevronDown className="ml-auto h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="px-4 pb-4 animate-in fade-in-0 slide-in-from-top-1">{children}</div>
    </details>
  );
}

function Quiz({ day }: { day: Day }) {
  const [pick, setPick] = useState<number | null>(null);
  const q = day.quiz!;
  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-fun-amber-soft px-4 py-2 text-fun-amber-ink">
        <strong>💡 Fun fact:</strong> {day.fact}
      </p>
      <p className="font-bold">{q.q}</p>
      <div className="grid gap-2">
        {q.options.map((o, i) => {
          const right = pick !== null && i === q.answer;
          const wrong = pick === i && i !== q.answer;
          return (
            <button
              key={o}
              type="button"
              onClick={() => setPick(i)}
              className={cn(
                "min-h-11 rounded-xl border-2 px-4 text-left font-semibold transition",
                right && "border-fun-green bg-fun-green-soft text-fun-green-ink",
                wrong && "border-fun-pink bg-fun-pink-soft text-fun-pink-ink",
                !right && !wrong && "hover:border-primary",
              )}
            >
              {o} {right && "✅"} {wrong && "❌"}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="text-sm font-bold">
        {pick === null ? "" : pick === q.answer ? "Correct! Super explorer! 🎉" : "Nice try! The green one is correct. 💪"}
      </p>
    </div>
  );
}
