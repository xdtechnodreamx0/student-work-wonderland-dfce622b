import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { WORKSHEETS, PROMPT_TIPS } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { Lightbox } from "@/components/club/Lightbox";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/worksheets")({
  head: () => pageMeta("Worksheets", "The “Good Prompt, Great Result!” and “AI Prompt Builder” worksheets we used to learn prompt writing."),
  component: Worksheets,
});

function Worksheets() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <PageHeader eyebrow="📝 Worksheets" emoji="✏️" title="Our prompt worksheets" intro="Tap a worksheet to zoom in and read every detail." />
      <Section>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {WORKSHEETS.map((w, i) => (
            <Reveal key={w.src} delay={i * 120}>
              <article className="card-fun lift flex h-full flex-col overflow-hidden">
                <button type="button" onClick={() => setOpen(i)} className="group relative block overflow-hidden bg-muted" aria-label={`Zoom worksheet: ${w.title}`}>
                  <img src={w.src} alt={w.alt} width={w.width} height={w.height} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm font-bold shadow">
                    <ZoomIn className="h-4 w-4" /> Zoom
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-bold">
                    {w.emoji} {w.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{w.description}</p>
                  <p className="mt-3 rounded-xl bg-secondary px-4 py-2 font-semibold text-secondary-foreground">
                    <strong>How we used it:</strong> {w.used}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 max-w-5xl rounded-3xl bg-fun-amber-soft p-7">
          <h2 className="text-2xl font-bold text-fun-amber-ink">⭐ Tips to write a good prompt</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PROMPT_TIPS.map((t) => (
              <li key={t} className="rounded-xl bg-card px-4 py-2 font-semibold">
                ⭐ {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-display text-xl font-semibold">Remember: the better your prompt, the better the result! 💖</p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/playground">Try the prompt games →</Link>
          </Button>
        </Reveal>
      </Section>
      <Lightbox items={WORKSHEETS} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
