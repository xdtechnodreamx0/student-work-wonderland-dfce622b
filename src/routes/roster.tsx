import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CONFIG, ROSTER, displayName, filterRoster } from "@/lib/club-data";
import { clubContentQuery } from "@/lib/club-content";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { FUN, FUN_ORDER } from "@/components/club/Art";

export const Route = createFileRoute("/roster")({
  head: () => pageMeta("Meet the explorers", "The full roster of Class 4C explorers in the Math Blog Club, with a quick name search."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: Roster,
});

function Roster() {
  const [q, setQ] = useState("");
  const { data } = useSuspenseQuery(clubContentQuery);
  const names = useMemo(() => (data.roster && data.roster.length > 0 ? data.roster.map((r) => r.name) : ROSTER), [data.roster]);
  const list = useMemo(() => names.map((name, i) => ({ name, i })), [names]);
  const shown = useMemo(() => {
    const keep = new Set(filterRoster(names, q));
    return list.filter((x) => keep.has(x.name));
  }, [q, list, names]);

  return (
    <>
      <PageHeader eyebrow="🧒 Roster" emoji="⭐" title={`Meet the ${names.length} Explorers`} intro={`Every explorer of ${CONFIG.classLabel} (${CONFIG.classCode}).`} />
      <Section>
        <div className="mx-auto max-w-6xl">
          <div className="card-fun flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <label htmlFor="roster-search" className="sr-only">
              Search explorers by name
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="roster-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a name… e.g. Soha"
                className="min-h-12 w-full rounded-full border-2 bg-background pl-12 pr-12 text-base outline-none transition focus:border-primary"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p aria-live="polite" className="text-center font-bold text-muted-foreground sm:text-right">
              Showing {shown.length} of {names.length}
            </p>
          </div>

          {shown.length === 0 ? (
            <p className="mt-10 rounded-3xl bg-muted p-10 text-center text-lg font-semibold">
              No explorer found. Try a different name! 🔍
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {shown.map(({ name, i }, k) => {
                const c = FUN[FUN_ORDER[i % FUN_ORDER.length] ?? "blue"];
                return (
                  <Reveal as="li" key={name} delay={Math.min(k, 12) * 40}>
                    <div className="card-fun lift flex h-full flex-col items-center p-5 text-center">
                      <span className={`grid h-16 w-16 place-items-center rounded-full font-display text-2xl font-bold ${c.soft} ${c.ink}`} aria-hidden="true">
                        {name[0]}
                      </span>
                      <p className="mt-3 font-bold leading-snug">{displayName(name)}</p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">Explorer</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">4C</span>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </Section>
    </>
  );
}
