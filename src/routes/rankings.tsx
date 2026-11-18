import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, Section } from "@/components/club/Bits";
import { getRankings } from "@/lib/pixel.functions";
import { sortByEmoji, sortByScore, tierLabel } from "@/lib/luck";
import { LEVELS } from "@/lib/learning-data";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

const rankingsQuery = queryOptions({ queryKey: ["rankings"], queryFn: () => getRankings(), staleTime: 30_000 });

export const Route = createFileRoute("/rankings")({
  head: () => pageMeta("Rankings", "Who is leading the Learning Path, and who has the rarest lucky emoji?"),
  loader: ({ context }) => context.queryClient.ensureQueryData(rankingsQuery),
  component: Rankings,
});

const MEDAL = ["🥇", "🥈", "🥉"];

function Rankings() {
  const { data } = useSuspenseQuery(rankingsQuery);
  const [tab, setTab] = useState<"score" | "emoji">("score");
  const rows = tab === "score" ? sortByScore(data) : sortByEmoji(data);
  return (
    <>
      <PageHeader eyebrow="🏅 Rankings" emoji="📊" title="Explorer rankings" intro="Progress rankings update every time an explorer finishes a challenge. Pixel writes a fresh description for everyone!" />
      <Section>
        <div className="mx-auto max-w-4xl space-y-6">
          <div role="tablist" aria-label="Ranking type" className="flex justify-center gap-2">
            {(["score", "emoji"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={cn("min-h-11 rounded-full px-5 font-bold transition", tab === t ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {t === "score" ? "⭐ Overall progress" : "🦄 Best emoji"}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">No explorer has started the Learning Path yet. Be the first! 🚀</p>
          ) : (
            <ol className="space-y-3">
              {rows.map((r, i) => (
                <li key={r.display_name} className={cn("flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-sm", i < 3 && "ring-2 ring-fun-amber")}>
                  <span className="w-10 text-center font-display text-2xl font-bold">{MEDAL[i] ?? i + 1}</span>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted text-3xl" title={r.top_emoji ? `${tierLabel(r.top_emoji_rank)} emoji` : "No emoji yet"} aria-hidden="true">{r.top_emoji ?? "🌱"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold">{r.display_name}</p>
                    {r.summary && <p className="text-sm text-muted-foreground">{r.summary}</p>}
                    <p className="mt-1 text-xs font-semibold">
                      {tab === "score"
                        ? `Levels ${r.level_count}/${LEVELS.length} · ${r.lessons} lessons · ${r.challenges_done} challenges · 🏅 ${r.certificates}`
                        : `${r.top_emoji ? tierLabel(r.top_emoji_rank) : "—"} · ${r.emoji_count} emojis · 🍀 luck ${r.luck}`}
                    </p>
                  </div>
                  <span className="font-display text-xl font-bold">{tab === "score" ? `${r.score} ⭐` : ""}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Section>
    </>
  );
}
