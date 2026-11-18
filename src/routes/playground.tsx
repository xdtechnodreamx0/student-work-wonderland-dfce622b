import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { CardPuzzle, PromptBuilder, WeakStrong } from "@/components/playground/PromptTools";
import { AISays, PromptDoctor, TestChecklist } from "@/components/playground/GameTools";

export const Route = createFileRoute("/playground")({
  head: () => pageMeta("Prompt Playground", "Six prompt games: Prompt Builder, Card Puzzle, Weak vs Strong, Prompt Doctor, Test Checklist and AI Says!"),
  component: Playground,
});

const TOOLS = [
  { id: "builder", emoji: "⚡", label: "Prompt Builder", intro: "Pick options and watch the Prompt Formula build a prompt for you.", el: <PromptBuilder /> },
  { id: "puzzle", emoji: "🧩", label: "Card Puzzle", intro: "Our real class activity! Arrange the 12 prompt cards into one big prompt.", el: <CardPuzzle /> },
  { id: "weak", emoji: "💪", label: "Weak vs Strong", intro: "Flip the switch and see what makes a prompt strong.", el: <WeakStrong /> },
  { id: "doctor", emoji: "🩺", label: "Prompt Doctor", intro: "Fix a sick prompt and earn up to 6 stars.", el: <PromptDoctor /> },
  { id: "check", emoji: "✅", label: "Test Checklist", intro: "Tick all five to get a surprise!", el: <TestChecklist /> },
  { id: "says", emoji: "🤖", label: "AI Says!", intro: "Like Simon Says — but with website instructions.", el: <AISays /> },
];

function Playground() {
  return (
    <>
      <PageHeader eyebrow="🎮 Playground" emoji="🕹️" title="Prompt Playground" intro="Six games to practise what we learned. Everything stays on your device — nothing is sent anywhere." />
      <Section>
        <Reveal className="mx-auto max-w-6xl">
          <Tabs defaultValue="builder">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {TOOLS.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="min-h-11 rounded-full border-2 bg-card px-4 font-bold data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span aria-hidden="true">{t.emoji}</span> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TOOLS.map((t) => (
              <TabsContent key={t.id} value={t.id} className="mt-6">
                <div className="card-fun p-5 sm:p-8">
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    {t.emoji} {t.label}
                  </h2>
                  <p className="mb-6 mt-1 text-muted-foreground">{t.intro}</p>
                  {t.el}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </Section>
    </>
  );
}
