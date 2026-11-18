import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/club/Bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { canEditContent, mainRole, ROLE_EMOJI, ROLE_LABEL } from "@/lib/accounts";
import { FORMULA, scorePrompt } from "@/lib/prompt-doctor";
import { pageMeta } from "@/lib/seo";
import { ProgressReport } from "@/components/learn/ProgressReport";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/me")({
  head: () => pageMeta("My page", "Your own Math Blog Club page with your prompt notebook."),
  component: MyPage,
});

function MyPage() {
  const auth = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const score = scorePrompt(text);
  const role = mainRole(auth.roles);

  const prompts = useQuery({
    queryKey: ["my-prompts", auth.userId],
    enabled: !!auth.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_prompts")
        .select("id, prompt, stars, created_at")
        .eq("user_id", auth.userId ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const prompt = text.trim();
    if (!prompt) return void toast.error("Write a prompt first!");
    const { error } = await supabase.from("student_prompts").insert({ prompt, stars: score.stars, ...(auth.userId ? { user_id: auth.userId } : {}) });
    if (error) return void toast.error("Could not save your prompt.");
    toast.success("Saved to your notebook! ⭐");
    setText("");
    void qc.invalidateQueries({ queryKey: ["my-prompts"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("student_prompts").delete().eq("id", id);
    if (error) return void toast.error("Could not remove it.");
    void qc.invalidateQueries({ queryKey: ["my-prompts"] });
  };

  return (
    <>
      <PageHeader
        eyebrow={role ? `${ROLE_EMOJI[role]} ${ROLE_LABEL[role]}` : "👋 My page"}
        emoji="🚀"
        title={`Hi, ${auth.profile?.display_name ?? "explorer"}!`}
        intro="This is your own page. Write prompts, see your stars, and keep your best ones in your notebook."
      />
      <Section>
        <div className="mx-auto mb-8 max-w-5xl"><ProgressReport /></div>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={save} className="card-fun space-y-4 p-6">
            <h2 className="text-2xl font-bold">✍️ Write a prompt</h2>
            <Label htmlFor="my-prompt" className="sr-only">Your prompt</Label>
            <Textarea
              id="my-prompt"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              rows={5}
              placeholder="Create a website for… It is for… Use … colours…"
              className="text-base"
            />
            <div className="flex items-center justify-between">
              <span className="text-2xl" aria-label={`${score.stars} of 6 stars`}>
                {"⭐".repeat(score.stars)}
                <span className="opacity-25">{"⭐".repeat(6 - score.stars)}</span>
              </span>
              <span className="text-xs text-muted-foreground">{text.length} / 300</span>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Prompt Formula parts">
              {FORMULA.map((f) => {
                const ok = score.found.includes(f.id);
                return (
                  <li key={f.id} className={cn("rounded-full px-3 py-1 text-sm font-bold", ok ? "bg-fun-green-soft text-fun-green-ink" : "bg-muted text-muted-foreground")}>
                    {f.emoji} {f.label} {ok ? "✓" : ""}
                  </li>
                );
              })}
            </ul>
            <Button type="submit" size="lg">
              <Save className="h-5 w-5" /> Save to my notebook
            </Button>
          </form>

          <div className="space-y-6">
            {canEditContent(auth.roles) && (
              <div className="card-fun p-6">
                <p className="font-semibold">You can update the club site.</p>
                <Button asChild className="mt-3">
                  <Link to="/teacher">Open the teacher page</Link>
                </Button>
              </div>
            )}
            <div className="card-fun p-6">
              <h2 className="text-2xl font-bold">📒 My notebook</h2>
              <ul className="mt-4 space-y-3">
                {prompts.isLoading && <li className="text-muted-foreground">Loading…</li>}
                {prompts.data?.length === 0 && <li className="text-muted-foreground">Nothing saved yet. Your first prompt goes here!</li>}
                {prompts.data?.map((p) => (
                  <li key={p.id} className="rounded-2xl bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <span aria-label={`${p.stars} of 6 stars`}>{"⭐".repeat(p.stars) || "—"}</span>
                      <button type="button" onClick={() => void remove(p.id)} aria-label="Remove this prompt" className="rounded-lg p-1 hover:bg-muted">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1">{p.prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="outline" onClick={() => void auth.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
