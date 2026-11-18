import { createFileRoute } from "@tanstack/react-router";
import { FOUNDER, MENTORS, TEACHER, CONFIG } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { FounderBadge, PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FounderEmblem, FUN } from "@/components/club/Art";

export const Route = createFileRoute("/team")({
  head: () => pageMeta("Meet the team", "Founder Muhammad Salman, mentors Lavanya, Ekta and Meer Fahad, and facilitator Miss Sana Kashif."),
  component: Team,
});

function Team() {
  return (
    <>
      <PageHeader eyebrow="👋 The team" emoji="🧑‍🏫" title="The people behind the club" intro="Four mentors and one teacher who guided 25 explorers." />

      <Section>
        <div className="mx-auto max-w-5xl space-y-8">
          <Reveal className="founder-ring relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-fun-purple-soft" aria-hidden="true" />
            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="relative">
                <FounderEmblem className="h-32 w-32 animate-float drop-shadow-xl" />
                <span className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full bg-card text-xl shadow" aria-hidden="true">
                  ⭐
                </span>
              </div>
              <div className="flex-1">
                <FounderBadge />
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{FOUNDER.name}</h2>
                <p className="font-bold text-primary">
                  {FOUNDER.role} · Class {FOUNDER.className}
                </p>
                <p className="mt-3 text-lg text-muted-foreground">{FOUNDER.line}</p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-2xl font-bold">Mentors · peer educators</h2>
            </Reveal>
            <ul className="mt-5 grid gap-5 sm:grid-cols-3">
              {MENTORS.map((m, i) => (
                <Reveal as="li" key={m.name} delay={i * 100}>
                  <div className="card-fun lift group h-full p-6 text-center">
                    <span
                      className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-4xl ring-4 ring-offset-4 transition group-hover:rotate-12 ${FUN[m.color].soft} ${FUN[m.color].ring}`}
                      aria-hidden="true"
                    >
                      {m.emoji}
                    </span>
                    <h3 className="mt-5 text-xl font-semibold">{m.name}</h3>
                    <p className={`font-bold ${FUN[m.color].ink}`}>Class {m.className}</p>
                    <p className="mt-2 text-muted-foreground">{m.line}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal className="card-fun lift flex flex-col items-center gap-5 p-6 sm:flex-row">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-fun-amber-soft text-4xl ring-4 ring-fun-amber ring-offset-4" aria-hidden="true">
              {TEACHER.emoji}
            </span>
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold uppercase tracking-wide text-fun-amber-ink">Teacher · {TEACHER.role}</p>
              <h2 className="text-2xl font-bold">{TEACHER.name}</h2>
              <p className="text-muted-foreground">
                Guided {CONFIG.classLabel} through every day of the {CONFIG.subtitle}.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
