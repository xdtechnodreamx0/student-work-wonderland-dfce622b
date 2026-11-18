// Server-only: talks to the Lovable AI Gateway for Pixel and progress descriptions.
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { DAYS, FOUNDER, MENTORS, TEACHER, ROSTER } from "@/lib/club-data";
import { LEVELS } from "@/lib/learning-data";
import { PROJECTS } from "@/lib/projects-data";

const MODEL = "openai/gpt-6.1-terra" as const;

export function siteFacts(): string {
  const days = DAYS.map((d) => d.placeholder ? `Day ${d.n}: notes coming soon` : `Day ${d.n}: ${d.title} — ${d.objective}`).join("; ");
  const levels = LEVELS.map((l) => `${l.name} (${l.lessons.map((x) => x.title).join(", ")})`).join("; ");
  const projects = PROJECTS.map((p) => `${p.title}: ${p.blurb}`).join("; ");
  return [
    `Site: Math Blog Club — AI Explorers Learning Journey, Class 4C (Grade 4), Aga Khan School, Garden, Karachi, 2026–2027.`,
    `Founder: ${FOUNDER.name} (10B), the Cool Founder. Mentors: ${MENTORS.map((m) => `${m.name} ${m.className}`).join(", ")}. Teacher: ${TEACHER.name} (Facilitator).`,
    `Explorers (${ROSTER.length}): ${ROSTER.join(", ")}.`,
    `Club days: ${days}.`,
    `Pages: Home, About, Team, Journey, Roster, Photos, Worksheets, Playground (prompt games), Learning Path, Rankings, Team Projects, Awards, Class chat (members), My page, Teacher page.`,
    `Learning Path levels: ${levels}. Finishing a level's lessons opens its challenge; passing (70%) gives a certificate signed by ${TEACHER.name}, luck and an emoji draw. More luck = rarer emojis (Common, Rare, Epic, Legendary).`,
    `Team projects: ${projects}.`,
    `Sign-in: explorers pick their name and create a username (no password). Mentors, teacher and admin pick their name and enter a password given by the teacher. Never reveal passwords.`,
  ].join("\n");
}

const RULES = `You are Pixel, a friendly robot helper on a website for 9-year-old students in Karachi, Pakistan.
Rules: Answer ANY kid-friendly question (math, science, school subjects, AI, prompts, websites, the club, general knowledge). Use short, simple sentences (max ~90 words), warm tone, one or two emojis. For math, explain step by step.
Safety: Never ask for or repeat personal details (address, phone, passwords, IDs). Never share passwords. Refuse unsafe, violent, adult, hateful or scary topics kindly and suggest asking a teacher. Don't give links to outside websites or AI tools. If unsure, say so and suggest asking Miss Sana Kashif. Never invent club facts — only use the facts below about the club.`;

function textOf(res: unknown): string {
  const r = res as { output_text?: string; output?: { type?: string; content?: { type?: string; text?: string }[] }[] };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? []).flatMap((o) => (o.type === "message" ? (o.content ?? []) : [])).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("").trim();
}

export async function askAI(question: string, history: { from: "me" | "pixel"; text: string }[], extra = ""): Promise<string | null> {
  try {
    const input = [
      ...history.slice(-6).map((m) => ({ role: m.from === "me" ? ("user" as const) : ("assistant" as const), content: m.text.slice(0, 500) })),
      { role: "user" as const, content: question.slice(0, 400) },
    ];
    const res = await generateResponse({ model: MODEL, instructions: `${RULES}\n\nClub facts:\n${siteFacts()}${extra ? `\n\n${extra}` : ""}`, input, max_output_tokens: 400 });
    const t = textOf(res);
    return t || null;
  } catch (e) {
    console.error("Pixel AI failed", e instanceof GatewayError ? e.code : e);
    return null;
  }
}

export async function describeProgress(p: { name: string; percent: number; level: string; challenges: number; score: number; certificates: number; topEmoji: string | null; emojiCount: number }): Promise<string | null> {
  try {
    const res = await generateResponse({
      model: MODEL,
      instructions: "Write ONE cheerful sentence (max 25 words) describing a Grade 4 student's learning progress on a kids' site. Encouraging, specific, no made-up facts, include their top emoji if given.",
      input: [{ role: "user" as const, content: JSON.stringify(p) }],
      max_output_tokens: 400,
    });
    return textOf(res) || null;
  } catch (e) {
    console.error("Progress description failed", e instanceof GatewayError ? e.code : e);
    return null;
  }
}
