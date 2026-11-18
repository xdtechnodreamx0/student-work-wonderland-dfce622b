import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AWARDS } from "@/lib/club-data";
import { clubContentQuery } from "@/lib/club-content";
import { mergeWinners } from "@/lib/club-merge";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FUN } from "@/components/club/Art";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/awards")({
  head: () => pageMeta("Showcase awards", "The five Day 12 Website Showcase awards: Best Prompt Writer, Website Design, Teamwork, Creative Idea and Presentation."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: Awards,
});

function Awards() {
  const { data } = useSuspenseQuery(clubContentQuery);
  const awards = mergeWinners(AWARDS, data.winners);
  return (
    <>
      <PageHeader eyebrow="🏆 Awards" emoji="🎉" title="Website Showcase Awards" intro="On Day 12 explorers presented their websites: the name, why they chose the topic, how they planned it, how they wrote the prompt and what AI created." />
      <Section>
        <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {awards.map((a, i) => {
            const c = FUN[a.color];
            return (
              <Reveal as="li" key={a.title} delay={i * 100}>
                <div className="card-fun lift group relative h-full overflow-hidden p-6 text-center">
                  <div className={cn("absolute inset-x-0 top-0 h-24", c.soft)} aria-hidden="true" />
                  <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-card text-4xl shadow-lift transition group-hover:animate-wiggle" aria-hidden="true">
                    🏆
                  </span>
                  <p className="relative mt-4 text-2xl" aria-hidden="true">
                    {a.emoji}
                  </p>
                  <h2 className="relative mt-1 text-lg font-semibold">{a.title}</h2>
                  <p className={cn("relative mt-3 rounded-full px-3 py-1 text-sm font-bold", c.soft, c.ink)}>
                    {a.winner ?? "Winner to be announced 🎉"}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
