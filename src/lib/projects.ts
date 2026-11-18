// Project rules and helpers shared by the browser and the server. No network calls here.
import { TIERS, type Tier } from "@/lib/luck";
import { PROJECTS } from "@/lib/projects-data";

export type ProjectSection = "team" | "extra" | "student";
export type TierId = Tier["id"];

export const SECTIONS: { id: ProjectSection; title: string; eyebrow: string; intro: string }[] = [
  { id: "team", title: "Team Projects", eyebrow: "🚀 Made by our team", intro: "Websites built by our club with AI and lots of planning." },
  { id: "extra", title: "Extra Projects", eyebrow: "🌟 Extra picks", intro: "More maths websites our staff picked for the club." },
  { id: "student", title: "Student Projects", eyebrow: "🧒 Made by explorers", intro: "Projects our explorers added themselves. Pixel watched each one, wrote about it and made a moving preview." },
];

export const SECTION_LABEL: Record<ProjectSection, string> = { team: "Team", extra: "Extra", student: "Student" };

export type ClubProject = {
  id: string;
  title: string;
  emoji: string;
  emoji_tier: TierId;
  emoji_reason: string;
  blurb: string;
  details: string;
  href: string;
  kind: "live" | "handmade";
  section: ProjectSection;
  group_name: string;
  members: string;
  credit: string;
  tags: string[];
  featured: boolean;
  sort_order: number;
  media_key: string | null;
  poster_url: string | null;
  video_path: string | null;
  video_status: "none" | "pending" | "ready" | "failed";
  maker_id: string | null;
  maker_name: string;
  maker_role: string;
  ai_status: "none" | "pending" | "done" | "failed";
  created_at: string;
};

/** Learning Path facts shown on an explorer's project card. */
export type MakerCredentials = { level_count: number; score: number; top_emoji: string | null; certificates: number };

export const PROJECT_COLUMNS =
  "id, title, emoji, emoji_tier, emoji_reason, blurb, details, href, kind, section, group_name, members, credit, tags, featured, sort_order, media_key, poster_url, video_path, video_status, maker_id, maker_name, maker_role, ai_status, created_at";

export const PROJECT_MEDIA_BUCKET = "project-media";

/** Links must be a secure website or one of our own hosted handmade pages. */
export function normalizeProjectUrl(raw: string): string | null {
  const s = raw.trim();
  if (/^\/projects\/[a-z0-9._-]+\.html$/i.test(s)) return s;
  const withScheme = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol === "http:") u.protocol = "https:";
    if (u.protocol !== "https:" || !u.hostname.includes(".")) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Projects earn an emoji the same way explorers do — but it comes from how good the project is, not from luck.
 * Quality 1–4 picks the tier (Common, Rare, Epic, Legendary); the theme picks the emoji inside that tier.
 */
export function tierForQuality(quality: number): Tier {
  const q = Math.max(1, Math.min(4, Math.round(quality)));
  return TIERS.find((t) => t.rank === q)!;
}

export function pickProjectEmoji(quality: number, wanted: string | null | undefined, seed: string): { emoji: string; tier: TierId } {
  const tier = tierForQuality(quality);
  if (wanted && tier.emojis.includes(wanted)) return { emoji: wanted, tier: tier.id };
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { emoji: tier.emojis[h % tier.emojis.length]!, tier: tier.id };
}

/** A simple title from a link when nothing better is known, e.g. "math-bloom.lovable.app" -> "Math Bloom". */
export function titleFromUrl(href: string): string {
  try {
    const u = new URL(href, "https://example.com");
    const base = u.pathname.startsWith("/projects/") ? u.pathname.replace(/^\/projects\//, "").replace(/\.html$/, "") : u.hostname.split(".")[0] ?? "";
    const words = base.split(/[-_.]+/).filter(Boolean);
    return words.length ? words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ") : "New project";
  } catch {
    return "New project";
  }
}

/** A live screenshot of a website (used as the poster and the first frame of the AI video). */
export function screenshotUrl(href: string): string | null {
  return href.startsWith("https://") ? `https://image.thum.io/get/width/1280/crop/800/noanimate/${href}` : null;
}

export function sortProjects<T extends Pick<ClubProject, "featured" | "sort_order" | "created_at">>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order || b.created_at.localeCompare(a.created_at));
}

/** Built-in projects, used only if the database can't be reached. */
export function fallbackProjects(): ClubProject[] {
  return PROJECTS.map((p, i) => ({
    id: p.id,
    title: p.title,
    emoji: p.emoji,
    emoji_tier: "rare",
    emoji_reason: "",
    blurb: p.blurb,
    details: "",
    href: p.href,
    kind: p.kind,
    section: "team",
    group_name: "",
    members: "",
    credit: p.credit ?? "",
    tags: p.tags,
    featured: !!p.featured,
    sort_order: i + 1,
    media_key: p.id,
    poster_url: null,
    video_path: null,
    video_status: "none",
    maker_id: null,
    maker_name: "",
    maker_role: "",
    ai_status: "done",
    created_at: "2026-11-10T00:00:00Z",
  }));
}
