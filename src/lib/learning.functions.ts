import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ALL_LESSON_IDS, currentLevelName, findLevel, gradeChallenge, isChallengeOpen, isLevelUnlocked, pathPercent } from "@/lib/learning-data";
import { bestEmoji, drawEmoji, LUCK_PER_CHALLENGE, LUCK_PER_LESSON, MAX_LUCK, type OwnedEmoji } from "@/lib/luck";
import { TEACHER } from "@/lib/club-data";

export type Certificate = { level: string; levelName: string; name: string; date: string; topEmoji: string; signer: string };
export type Progress = {
  display_name: string;
  done_lessons: string[];
  passed_levels: string[];
  challenges_done: number;
  score: number;
  luck: number;
  emojis: OwnedEmoji[];
  certificates: Certificate[];
  top_emoji: string | null;
  top_emoji_rank: number;
  summary: string | null;
};

type Ctx = { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function loadOrCreate(ctx: Ctx): Promise<Progress> {
  const db = await admin();
  const { data } = await db.from("explorer_progress").select("*").eq("user_id", ctx.userId).maybeSingle();
  if (data) return data as unknown as Progress;
  const [{ data: prof }, { data: roles }] = await Promise.all([
    db.from("profiles").select("display_name").eq("id", ctx.userId).maybeSingle(),
    db.from("user_roles").select("role").eq("user_id", ctx.userId),
  ]);
  const row = { user_id: ctx.userId, display_name: prof?.display_name ?? "Explorer", is_student: (roles ?? []).some((r) => r.role === "student") };
  const { data: ins, error } = await db.from("explorer_progress").insert(row).select("*").single();
  if (error) throw new Error("Couldn't start your progress. Please try again.");
  return ins as unknown as Progress;
}

async function save(userId: string, p: Progress, refreshSummary: boolean) {
  const db = await admin();
  const top = bestEmoji(p.emojis);
  let summary = p.summary;
  if (refreshSummary) {
    const { describeProgress } = await import("@/lib/pixel-ai.server");
    const facts = { name: p.display_name.split(" ")[0] ?? p.display_name, percent: pathPercent(p.done_lessons, p.passed_levels), level: currentLevelName(p.passed_levels), challenges: p.challenges_done, score: p.score, certificates: p.certificates.length, topEmoji: top?.emoji ?? null, emojiCount: p.emojis.length };
    summary = (await describeProgress(facts)) ?? `${facts.name} has finished ${facts.percent}% of the path and is on the ${facts.level} level ${top?.emoji ?? "🌱"}`;
  }
  const { error } = await db.from("explorer_progress").update({
    done_lessons: p.done_lessons, passed_levels: p.passed_levels, challenges_done: p.challenges_done, score: p.score, luck: p.luck,
    emojis: p.emojis as never, certificates: p.certificates as never, top_emoji: top?.emoji ?? null, top_emoji_rank: top?.rank ?? 0, summary, updated_at: new Date().toISOString(),
  }).eq("user_id", userId);
  if (error) throw new Error("Couldn't save your progress. Please try again.");
  return { ...p, top_emoji: top?.emoji ?? null, top_emoji_rank: top?.rank ?? 0, summary };
}

export const getMyProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadOrCreate(context as unknown as Ctx));

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { lessonId: string }) => ({ lessonId: String(d.lessonId).slice(0, 10) }))
  .handler(async ({ data, context }) => {
    if (!ALL_LESSON_IDS.includes(data.lessonId)) throw new Error("Unknown lesson.");
    const p = await loadOrCreate(context as unknown as Ctx);
    if (p.done_lessons.includes(data.lessonId)) return p;
    p.done_lessons = [...p.done_lessons, data.lessonId];
    p.score += 5;
    p.luck = Math.min(MAX_LUCK, p.luck + LUCK_PER_LESSON);
    return save(context.userId, p, false);
  });

export const submitChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { levelId: string; answers: number[] }) => ({ levelId: String(d.levelId).slice(0, 20), answers: (Array.isArray(d.answers) ? d.answers : []).slice(0, 10).map((n) => Number(n)) }))
  .handler(async ({ data, context }) => {
    const level = findLevel(data.levelId);
    if (!level) throw new Error("Unknown level.");
    const p = await loadOrCreate(context as unknown as Ctx);
    if (!isLevelUnlocked(level.id, p.passed_levels)) throw new Error("Finish the earlier levels first.");
    if (!isChallengeOpen(level, p.done_lessons)) throw new Error("Finish every lesson in this level first.");
    const result = gradeChallenge(level, data.answers);
    p.challenges_done += 1;
    p.score += result.correct * 10;
    p.luck = Math.min(MAX_LUCK, p.luck + LUCK_PER_CHALLENGE);
    const drawn = drawEmoji(p.luck);
    const owned: OwnedEmoji = { ...drawn, at: new Date().toISOString() };
    p.emojis = [...p.emojis, owned];
    let certificate: Certificate | null = null;
    if (result.passed && !p.passed_levels.includes(level.id)) {
      p.passed_levels = [...p.passed_levels, level.id];
      p.score += 50;
      certificate = { level: level.id, levelName: level.name, name: p.display_name, date: new Date().toISOString().slice(0, 10), topEmoji: bestEmoji(p.emojis)?.emoji ?? owned.emoji, signer: TEACHER.name };
      p.certificates = [...p.certificates, certificate];
    }
    const saved = await save(context.userId, p, true);
    return { progress: saved, result, drawn: owned, certificate };
  });
