import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { cleanChat } from "@/lib/chat-filter";

type Hist = { from: "me" | "pixel"; text: string };
const hist = (h: unknown): Hist[] =>
  (Array.isArray(h) ? h : []).slice(-8).map((m: { from?: string; text?: unknown }) => ({ from: m?.from === "me" ? ("me" as const) : ("pixel" as const), text: String(m?.text ?? "").slice(0, 500) }));

async function staffReport(): Promise<string> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const [logins, prog] = await Promise.all([
    db.from("club_logins").select("display_name, kind, signed_in, signed_in_at, username"),
    db.from("explorer_progress").select("display_name, is_student, done_lessons, passed_levels, challenges_done, score, luck, top_emoji, game_points, games_played, updated_at"),
  ]);
  const on = (logins.data ?? []).filter((l) => l.signed_in).map((l) => `${l.display_name} (${l.kind}${l.signed_in_at ? `, since ${l.signed_in_at.slice(0, 16).replace("T", " ")} UTC` : ""})`);
  const used = (logins.data ?? []).filter((l) => l.kind === "student" && l.username).length;
  const rows = (prog.data ?? []).map((p) => `${p.display_name}: lessons ${p.done_lessons.length}, levels ${p.passed_levels.join("/") || "none"}, challenges ${p.challenges_done}, score ${p.score}, luck ${p.luck}, top emoji ${p.top_emoji ?? "-"}, game points ${p.game_points} in ${p.games_played} games, last active ${p.updated_at.slice(0, 10)}`);
  return `STAFF-ONLY live report (you may share this with this staff member):\nSigned in right now: ${on.join(", ") || "nobody"}.\nExplorers who have made a username: ${used}.\nProgress:\n${rows.join("\n") || "No progress yet."}`;
}

async function isStaff(ctx: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string }) {
  const { data } = await ctx.supabase.rpc("is_staff", { _user_id: ctx.userId });
  return !!data;
}

/** Signed-in Pixel: staff get a live report on logins and progress; explorers get their own progress. */
export const askPixelMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { question: string; history?: Hist[] }) => ({ question: String(d.question ?? "").slice(0, 400), history: hist(d.history) }))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };
    const { askAI } = await import("@/lib/pixel-ai.server");
    const [{ data: prof }, staff] = await Promise.all([ctx.supabase.from("profiles").select("display_name").eq("id", ctx.userId).maybeSingle(), isStaff(ctx)]);
    let extra = `Chatting with: ${prof?.display_name ?? "a member"}${staff ? " (staff)" : " (explorer)"}.`;
    if (staff) extra += `\n${await staffReport()}`;
    else {
      const { data: p } = await ctx.supabase.from("explorer_progress").select("done_lessons, passed_levels, challenges_done, score, luck, top_emoji, game_points").eq("user_id", ctx.userId).maybeSingle();
      if (p) extra += `\nTheir own progress: ${JSON.stringify(p)}. Do not share other students' details beyond the public rankings.`;
    }
    return { text: await askAI(data.question, data.history, extra) };
  });

/** Pixel in the class chat: posts the question and Pixel's answer into the chat, using recent chat history. */
export const askPixelInChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { question: string }) => ({ question: String(d.question ?? "").slice(0, 300) }))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string };
    const check = cleanChat(data.question);
    if (!check.ok) throw new Error(check.reason);
    const { error: qErr } = await ctx.supabase.from("chat_messages").insert({ body: `🤖 Asked Pixel: ${check.text}` });
    if (qErr) throw new Error("Couldn't post your question.");
    const { data: recent } = await ctx.supabase.from("chat_messages").select("author_name, body, hidden").order("created_at", { ascending: false }).limit(40);
    const log = (recent ?? []).filter((m) => !m.hidden).reverse().map((m) => `${m.author_name}: ${m.body}`).join("\n");
    const { askAI } = await import("@/lib/pixel-ai.server");
    const answer = (await askAI(check.text, [], `You are answering inside the class group chat; everyone can read it. Keep it short. Recent chat (oldest first):\n${log}`)) ?? "Sorry, I can't think right now. Try again in a moment! 🤖";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("chat_messages").insert({ user_id: "00000000-0000-0000-0000-000000000000", author_name: "Pixel", author_role: "pixel", body: answer.replace(/\*\*(.+?)\*\*/g, "$1").slice(0, 1200) });
    return { ok: true };
  });
