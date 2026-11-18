import { Link } from "@tanstack/react-router";
import { Progress as Bar } from "@/components/ui/progress";
import { CertificateCard } from "@/components/learn/Certificate";
import { useProgress } from "@/hooks/use-progress";
import { LEVELS, currentLevelName, pathPercent } from "@/lib/learning-data";
import { bestEmoji, tierLabel, tierOdds } from "@/lib/luck";

export function ProgressReport() {
  const { data: p, isLoading } = useProgress();
  if (isLoading || !p) return <div className="card-fun p-6 text-muted-foreground">Loading your progress…</div>;
  const pct = pathPercent(p.done_lessons, p.passed_levels);
  const top = bestEmoji(p.emojis);
  const odds = tierOdds(p.luck);
  return (
    <section aria-labelledby="report" className="card-fun space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-muted text-5xl shadow-inner" aria-label={top ? `Top emoji ${top.emoji}, ${tierLabel(top.rank)}` : "No emoji yet"}>{top?.emoji ?? "🌱"}</span>
        <div className="flex-1">
          <h2 id="report" className="text-2xl font-bold">📈 My progress report</h2>
          <p className="text-muted-foreground">{p.summary ?? "Start the Learning Path and Pixel will write about your progress!"}</p>
        </div>
        <Link to="/learn" className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground">Continue learning →</Link>
      </div>
      <div>
        <p className="mb-1 font-semibold">Path {pct}% · Now on: {currentLevelName(p.passed_levels)}</p>
        <Bar value={pct} className="h-3" aria-label="Path progress" />
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Levels passed", `${p.passed_levels.length}/${LEVELS.length}`],
          ["Challenges done", p.challenges_done],
          ["Score", `${p.score} ⭐`],
          ["Luck", `${p.luck} 🍀`],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-muted p-3 text-center"><dt className="text-xs font-semibold text-muted-foreground">{k}</dt><dd className="font-display text-xl font-bold">{v}</dd></div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">Next draw odds — Legendary {Math.round(odds.legendary * 100)}%, Epic {Math.round(odds.epic * 100)}%, Rare {Math.round(odds.rare * 100)}%.</p>
      <div>
        <h3 className="mb-2 font-bold">🎁 Emoji collection ({p.emojis.length})</h3>
        {p.emojis.length === 0 ? <p className="text-muted-foreground">Pass a challenge to draw your first emoji.</p> : (
          <ul className="flex flex-wrap gap-2">{p.emojis.map((e, i) => <li key={i} title={tierLabel(e.rank)} className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-2xl">{e.emoji}</li>)}</ul>
        )}
      </div>
      <div>
        <h3 className="mb-2 font-bold">🏅 My credentials ({p.certificates.length})</h3>
        {p.certificates.length === 0 ? <p className="text-muted-foreground">No certificates yet — pass a level challenge to earn one.</p> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{p.certificates.map((c) => <CertificateCard key={c.level} c={c} small />)}</div>
        )}
      </div>
    </section>
  );
}
