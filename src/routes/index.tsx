import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONFIG, PHOTOS, STATS } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { PixelRobot, WaveDivider, FUN } from "@/components/club/Art";
import { Counter, Reveal, Section } from "@/components/club/Bits";
import { useHelper } from "@/components/club/PixelHelper";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Home", "We learned how websites are born — 12 days of paper, prompts and pixels with Class 4C at Aga Khan School, Garden."),
  component: Index,
});

const FLOATERS = [
  { e: "✨", c: "left-[6%] top-[12%]", d: "0s" },
  { e: "🧠", c: "left-[44%] top-[6%]", d: "1.2s" },
  { e: "🖥️", c: "left-[4%] bottom-[18%]", d: "2.1s" },
  { e: "🚀", c: "right-[6%] top-[10%]", d: "0.6s" },
  { e: "💬", c: "right-[40%] bottom-[10%]", d: "1.8s" },
];

const TOUR = [
  { to: "/journey", emoji: "🗺️", title: "The 12-Day Journey", text: "Every day, every activity, plus mini-quizzes.", color: "blue" },
  { to: "/playground", emoji: "🎮", title: "Prompt Playground", text: "Build prompts, solve the card puzzle, play AI Says!", color: "purple" },
  { to: "/roster", emoji: "🧒", title: "Meet the Explorers", text: "All 25 explorers of Class 4C.", color: "green" },
  { to: "/photos", emoji: "📸", title: "Photo Wall", text: "Moments from our club, polaroid style.", color: "pink" },
  { to: "/worksheets", emoji: "📝", title: "Worksheets", text: "The prompt sheets we used in class.", color: "amber" },
  { to: "/awards", emoji: "🏆", title: "Showcase Awards", text: "Five awards from Day 12.", color: "teal" },
] as const;

function Index() {
  const { setOpen } = useHelper();
  const lab = PHOTOS[0]!;
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        {FLOATERS.map((f) => (
          <span
            key={f.e}
            aria-hidden="true"
            className={`decor animate-float pointer-events-none absolute text-4xl sm:text-5xl ${f.c}`}
            style={{ animationDelay: f.d }}
          >
            {f.e}
          </span>
        ))}
        <div className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center gap-10 px-5 py-16 sm:px-10 lg:flex-row">
          <Reveal className="flex-1 text-center lg:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-sm font-bold text-primary shadow-sm">
              <Sparkles className="h-4 w-4" /> {CONFIG.subtitle}
            </p>
            <h1 className="text-5xl font-bold text-foreground sm:text-6xl xl:text-7xl">
              We learned how <span className="text-gradient">websites are born.</span>
            </h1>
            <p className="mt-5 text-xl text-muted-foreground">12 days. 1 class. A whole lot of paper, prompts, and pixels.</p>
            <p className="mt-2 font-semibold text-foreground">
              {CONFIG.school} · {CONFIG.classLabel} · {CONFIG.year}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg" variant="hero">
                <Link to="/journey">
                  Start the Journey <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/team">Meet the Club</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative flex flex-1 items-center justify-center">
            <figure className="polaroid relative w-64 sm:w-80" style={{ "--tilt": "4deg" } as React.CSSProperties}>
              <span className="tape" aria-hidden="true" />
              <img src={lab.src} alt={lab.alt} width={lab.width} height={lab.height} decoding="async" className="aspect-square w-full rounded-sm object-cover" />
              <figcaption className="absolute bottom-2 left-0 right-0 text-center font-display text-lg font-semibold">
                <span aria-hidden="true">💻</span> {lab.caption}
              </figcaption>
            </figure>
            <PixelRobot waving className="animate-float absolute -bottom-10 -left-4 h-36 w-36 drop-shadow-xl sm:-left-16 sm:h-44 sm:w-44" />
          </Reveal>
        </div>
        <WaveDivider />
      </section>

      <Section className="-mt-4">
        <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal as="li" delay={i * 90} key={s.label} className="card-fun lift p-6 text-center">
              <span className="text-4xl" aria-hidden="true">
                {s.emoji}
              </span>
              <p className="mt-2 font-display text-5xl font-bold text-primary">
                <Counter to={s.value} />
              </p>
              <p className="font-bold text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-3xl font-bold sm:text-4xl">Take the tour 🧭</h2>
            <p className="mt-2 text-muted-foreground">Pick a place to explore. Everything is safe to click!</p>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOUR.map((t, i) => (
              <Reveal key={t.to} delay={i * 70}>
                <Link to={t.to} className="card-fun lift group flex h-full flex-col p-6">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${FUN[t.color].soft}`} aria-hidden="true">
                    {t.emoji}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{t.title}</h3>
                  <p className="mt-1 flex-1 text-muted-foreground">{t.text}</p>
                  <span className={`mt-4 inline-flex items-center gap-1 font-bold ${FUN[t.color].ink}`}>
                    Let's go <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Reveal className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl bg-brand p-8 text-center text-primary-foreground sm:flex-row sm:text-left">
          <PixelRobot className="h-28 w-28 shrink-0 rounded-full bg-card p-2" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold sm:text-3xl">Got a question? Ask Pixel!</h2>
            <p className="mt-1 opacity-90">Our robot helper knows all about prompts, websites and every club day.</p>
          </div>
          <Button size="lg" variant="sunny" onClick={() => setOpen(true)}>
            Chat with Pixel 🤖
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
