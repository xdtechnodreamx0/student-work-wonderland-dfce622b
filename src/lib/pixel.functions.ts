import { createServerFn } from "@tanstack/react-start";

type Hist = { from: "me" | "pixel"; text: string };

/** Public: anyone can chat with Pixel. Returns null text when AI is unavailable (client falls back offline). */
export const askPixel = createServerFn({ method: "POST" })
  .inputValidator((d: { question: string; history?: Hist[]; me?: string }) => ({
    question: String(d.question ?? "").slice(0, 400),
    history: (Array.isArray(d.history) ? d.history : []).slice(-6).map((m) => ({ from: m.from === "me" ? ("me" as const) : ("pixel" as const), text: String(m.text ?? "").slice(0, 500) })),
    me: String(d.me ?? "").slice(0, 400),
  }))
  .handler(async ({ data }) => {
    if (!data.question.trim()) return { text: null as string | null };
    const { askAI } = await import("@/lib/pixel-ai.server");
    const extra = data.me ? `The person chatting (only use to personalise, never reveal to others): ${data.me}` : "";
    return { text: await askAI(data.question, data.history, extra) };
  });

export type RankingRow = { display_name: string; level_count: number; lessons: number; challenges_done: number; score: number; luck: number; emoji_count: number; top_emoji: string | null; top_emoji_rank: number; certificates: number; summary: string | null; game_points?: number; games_played?: number; };

export const getRankings = createServerFn({ method: "GET" }).handler(async (): Promise<RankingRow[]> => {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return [];
  const db = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
  });
  const { data, error } = await db.rpc("public_rankings");
  if (error) { console.error("rankings", error.message); return []; }
  return (data ?? []) as RankingRow[];
});
