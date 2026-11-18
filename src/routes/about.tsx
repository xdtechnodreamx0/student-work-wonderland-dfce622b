import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ACHIEVEMENTS, CONFIG, STEPS } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FUN, FUN_ORDER } from "@/components/club/Art";

export const Route = createFileRoute("/about")({
  head: () => pageMeta("About the club", "The story of Math Blog Club: Class 4C explorers who planned websites on paper, wrote prompts and built them with AI."),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader
        eyebrow="ℹ️ About the club"
        emoji="📚"
        title={
          <>
            Paper first, <span className="text-gradient">then AI.</span>
          </>
        }
        intro={CONFIG.tagline}
      />

      <Section>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
          <Reveal className="card-fun p-7 lg:col-span-3">
            <h2 className="text-2xl font-bold">Our story</h2>
            <div className="mt-4 space-y-4 text-lg">
              <p>
                <strong>{CONFIG.brand}</strong> is a club for the explorers of {CONFIG.classLabel} at {CONFIG.school},{" "}
                {CONFIG.city}. Over 12 days we went on the <strong>{CONFIG.subtitle}</strong>.
              </p>
              <p>
                First, we discovered what websites are and how they work. Then we found out that AI is a smart computer helper
                that follows our instructions.
              </p>
              <p>
                We planned our websites on paper, drew blueprints and made crafts. Next, we learned to write strong{" "}
                <strong>prompts</strong> using the Prompt Formula.
              </p>
              <p>
                Finally, in the computer lab, we generated our websites with AI, made one careful improvement, tested each
                other's work and showed it off at the Website Showcase! 🎉
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="rounded-3xl bg-sunny p-7 text-foreground lg:col-span-2">
            <p className="font-display text-xl font-semibold">The Prompt Formula</p>
            <ul className="mt-4 space-y-2">
              {["🎯 Topic", "👥 Audience", "🎨 Colours", "📄 Pages", "✨ Style", "🧰 Features"].map((f, i) => (
                <li key={f} className="flex items-center gap-2 rounded-xl bg-card/85 px-4 py-2 font-bold">
                  {f}
                  {i < 5 && <span className="ml-auto text-muted-foreground">+</span>}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-3xl font-bold">How a website is born</h2>
            <p className="mt-2 text-muted-foreground">The seven steps we followed, from a tiny idea to a big showcase.</p>
          </Reveal>
          <ol className="mt-8 grid gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {STEPS.map((s, i) => {
              const c = FUN[FUN_ORDER[i % FUN_ORDER.length] ?? "blue"];
              return (
                <Reveal as="li" key={s.label} delay={i * 80} className="relative">
                  <div className={`card-fun lift flex h-full flex-col items-center p-4 text-center ${c.soft}`}>
                    <span className="text-xs font-bold text-muted-foreground">Step {i + 1}</span>
                    <span className="my-2 text-4xl" aria-hidden="true">
                      {s.emoji}
                    </span>
                    <span className={`font-bold ${c.ink}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden="true" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-xl text-muted-foreground lg:block">
                      →
                    </span>
                  )}
                </Reveal>
              );
            })}
          </ol>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-3xl font-bold">🏅 Club achievements</h2>
            <p className="mt-2 text-muted-foreground">By the end of the first three days, explorers could…</p>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a, i) => (
              <Reveal as="li" key={a.text} delay={i * 80} className="card-fun lift flex items-start gap-4 p-5">
                <span className="text-3xl" aria-hidden="true">
                  {a.emoji}
                </span>
                <span className="flex-1 font-semibold">{a.text}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fun-green text-foreground animate-pop" style={{ animationDelay: `${300 + i * 120}ms` }}>
                  <Check className="h-4 w-4" aria-label="done" />
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
