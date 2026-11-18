// Combines the built-in club content with what the teacher added on the teacher page.
import type { Day } from "@/lib/club-data";

export type MergedDay = Day & { teacherNotes?: string[] };

function lines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

/** A placeholder day stays a placeholder until the teacher adds notes for it. */
export function mergeDays(days: Day[], notes: { day: number; title: string; notes: string }[]): MergedDay[] {
  return days.map((d) => {
    const n = notes.find((x) => x.day === d.n);
    if (!n) return d;
    if (d.placeholder) return { ...d, placeholder: false, title: n.title, objective: "", did: lines(n.notes) };
    return { ...d, teacherNotes: lines(n.notes) };
  });
}

export function mergeWinners<T extends { title: string; winner: string | null }>(awards: T[], winners: { award: string; winner: string }[]): T[] {
  return awards.map((a) => ({ ...a, winner: winners.find((w) => w.award === a.title)?.winner ?? a.winner }));
}
