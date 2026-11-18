import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AWARDS } from "@/lib/club-data";
import { clubContentQuery } from "@/lib/club-content";
import { mergeWinners } from "@/lib/club-merge";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FUN } from "@/components/club/Art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { canEditContent } from "@/lib/accounts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/awards")({
  head: () => pageMeta("Showcase awards", "The five Day 12 Website Showcase awards: Best Prompt Writer, Website Design, Teamwork, Creative Idea and Presentation."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: Awards,
});

function Awards() {
  const { data, refetch } = useSuspenseQuery(clubContentQuery);
  const auth = useAuth();
  const isStaff = canEditContent(auth.roles);

  const [editing, setEditing] = useState<string | null>(null);
  const [winnerInput, setWinnerInput] = useState("");
  const [saving, setSaving] = useState(false);

  const awards = mergeWinners(AWARDS, data.winners);

  const handleSaveWinner = async (awardTitle: string) => {
    setSaving(true);
    try {
      const trimmed = winnerInput.trim();
      const { error } = trimmed
        ? await supabase.from("award_winners").upsert({ award: awardTitle, winner: trimmed, updated_at: new Date().toISOString() })
        : await supabase.from("award_winners").delete().eq("award", awardTitle);

      if (error) throw error;
      toast.success(trimmed ? `Winner set for ${awardTitle}! 🏆` : `Cleared winner for ${awardTitle}`);
      setEditing(null);
      await refetch();
    } catch {
      toast.error("Could not update the winner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="🏆 Awards" emoji="🎉" title="Website Showcase Awards" intro="On Day 12 explorers presented their websites: the name, why they chose the topic, how they planned it, how they wrote the prompt and what AI created." />
      
      {isStaff && (
        <Section className="pb-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border bg-card p-4 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fun-amber" /> Staff Mode: Click the edit button on any award card below to set or update winners.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/teacher">Teacher Roster & Notes</Link>
            </Button>
          </div>
        </Section>
      )}

      <Section>
        <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {awards.map((a, i) => {
            const c = FUN[a.color];
            const isEditing = editing === a.title;

            return (
              <Reveal as="li" key={a.title} delay={i * 100}>
                <div className="card-fun lift group relative flex h-full flex-col justify-between overflow-hidden p-6 text-center">
                  <div>
                    <div className={cn("absolute inset-x-0 top-0 h-24", c.soft)} aria-hidden="true" />
                    <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-card text-4xl shadow-lift transition group-hover:animate-wiggle" aria-hidden="true">
                      🏆
                    </span>
                    <p className="relative mt-4 text-2xl" aria-hidden="true">
                      {a.emoji}
                    </p>
                    <h2 className="relative mt-1 text-lg font-semibold">{a.title}</h2>
                  </div>

                  <div className="relative mt-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          size={1}
                          value={winnerInput}
                          onChange={(e) => setWinnerInput(e.target.value)}
                          placeholder="Winner name(s)"
                          className="h-8 text-xs text-center"
                          autoFocus
                        />
                        <div className="flex justify-center gap-1">
                          <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleSaveWinner(a.title)} disabled={saving}>
                            <Check className="h-3 w-3 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditing(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={cn("rounded-full px-3 py-1 text-sm font-bold", c.soft, c.ink)}>
                          {a.winner ?? "Winner to be announced 🎉"}
                        </p>
                        {isStaff && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditing(a.title);
                              setWinnerInput(a.winner ?? "");
                            }}
                          >
                            <Pencil className="h-3 w-3" /> Edit winner
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
