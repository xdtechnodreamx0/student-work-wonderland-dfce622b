// Luck and emoji draws. Luck grows with every challenge; more luck = better odds of rare emojis.

export type Tier = { id: "common" | "rare" | "epic" | "legendary"; label: string; rank: number; emojis: string[] };

export const TIERS: Tier[] = [
  { id: "common", label: "Common", rank: 1, emojis: ["⭐", "🍀", "🎈", "🌼", "🐣", "🍎"] },
  { id: "rare", label: "Rare", rank: 2, emojis: ["🦊", "🚲", "🎨", "🧩", "🐬", "🌈"] },
  { id: "epic", label: "Epic", rank: 3, emojis: ["🦄", "🚀", "🐉", "🔮", "🎸"] },
  { id: "legendary", label: "Legendary", rank: 4, emojis: ["👑", "💎", "🌟", "🏆"] },
];

export const LUCK_PER_CHALLENGE = 10;
export const LUCK_PER_LESSON = 2;
export const MAX_LUCK = 100;

/** Chance (0–1) of each tier for a given luck value. Always sums to 1. */
export function tierOdds(luck: number): Record<Tier["id"], number> {
  const l = Math.max(0, Math.min(MAX_LUCK, luck)) / MAX_LUCK;
  const legendary = 0.02 + 0.13 * l;
  const epic = 0.08 + 0.22 * l;
  const rare = 0.25 + 0.1 * l;
  return { common: 1 - legendary - epic - rare, rare, epic, legendary };
}

export function drawEmoji(luck: number, roll = Math.random(), pick = Math.random()) {
  const odds = tierOdds(luck);
  let acc = 0;
  let tier: Tier = TIERS[0]!;
  for (const t of [...TIERS].reverse()) {
    acc += odds[t.id];
    if (roll < acc) {
      tier = t;
      break;
    }
  }
  const emoji = tier.emojis[Math.floor(pick * tier.emojis.length) % tier.emojis.length]!;
  return { emoji, tier: tier.id, rank: tier.rank };
}

export type OwnedEmoji = { emoji: string; tier: Tier["id"]; rank: number; at: string };

export function bestEmoji(list: readonly OwnedEmoji[]): OwnedEmoji | null {
  return list.reduce<OwnedEmoji | null>((b, e) => (!b || e.rank > b.rank ? e : b), null);
}

export function tierLabel(rank: number): string {
  return TIERS.find((t) => t.rank === rank)?.label ?? "";
}

export type RankRow = { display_name: string; score: number; top_emoji_rank: number; emoji_count: number };

export function sortByScore<T extends RankRow>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => b.score - a.score || a.display_name.localeCompare(b.display_name));
}

export function sortByEmoji<T extends RankRow>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => b.top_emoji_rank - a.top_emoji_rank || b.emoji_count - a.emoji_count || b.score - a.score || a.display_name.localeCompare(b.display_name));
}
