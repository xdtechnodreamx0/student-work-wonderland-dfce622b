// Server-only: Pixel looks at a project, writes about it, picks its emoji and makes a moving preview.
import { downloadVideo, GatewayError, generateResponse, generateVideo, getVideo } from "@lovable.dev/ai-gateway";
import { TIERS } from "@/lib/luck";
import { pickProjectEmoji, screenshotUrl, titleFromUrl, type TierId } from "@/lib/projects";

const TEXT_MODEL = "openai/gpt-6.1-terra" as const;
const VIDEO_MODEL = "google/gemini-omni-1.1-flash" as const;

export type ProjectFacts = { href: string; title?: string; blurb?: string; details?: string; makerName?: string; tags?: string[] };
export type ProjectWriteUp = { title: string; blurb: string; details: string; tags: string[]; emoji: string; emoji_tier: TierId; emoji_reason: string; ai: boolean };

/** Reads the visible words of a public web page (first ~6,000 characters). */
async function pageText(href: string): Promise<string> {
  if (!href.startsWith("https://")) return "";
  try {
    const res = await fetch(href, { redirect: "follow", headers: { "user-agent": "MathBlogClubBot/1.0 (+school project)" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return "";
    const html = (await res.text()).slice(0, 400_000);
    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "";
    const desc = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i.exec(html)?.[1] ?? "";
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    return `Title: ${title}\nDescription: ${desc}\nText: ${body}`.slice(0, 6000);
  } catch {
    return "";
  }
}

function textOf(res: unknown): string {
  const r = res as { output_text?: string; output?: { type?: string; content?: { type?: string; text?: string }[] }[] };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? []).flatMap((o) => (o.type === "message" ? (o.content ?? []) : [])).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("").trim();
}

const EMOJI_GUIDE = TIERS.map((t) => `${t.rank} = ${t.label}: ${t.emojis.join(" ")}`).join("\n");

const INSTRUCTIONS = `You review school projects for "Math Blog Club", a kids' club (Grade 4, Karachi). A project is usually a small website made with AI.
Write for 9-year-olds: short, warm, specific, no made-up features. If the page text is empty, describe the project only from its title and link, and keep it general.
Rate the project's quality and effort from 1 to 4 (1 = simple start, 2 = good, 3 = great with games/quizzes/nice design, 4 = outstanding and complete).
Then pick ONE emoji from the row that matches the rating, choosing the one that best fits the project's theme:
${EMOJI_GUIDE}
Return only JSON.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "blurb", "details", "tags", "quality", "emoji", "emoji_reason"],
  properties: {
    title: { type: "string", description: "Short project name, max 60 characters" },
    blurb: { type: "string", description: "One or two sentences, max 220 characters" },
    details: { type: "string", description: "3-5 short sentences: what you can do there, who it is for, what is special" },
    tags: { type: "array", items: { type: "string" }, description: "2-4 short labels like Quizzes, Grades 1-3, Games" },
    quality: { type: "integer", minimum: 1, maximum: 4 },
    emoji: { type: "string" },
    emoji_reason: { type: "string", description: "One kid-friendly sentence on why it earned this emoji, max 120 characters" },
  },
} as const;

function clean(s: unknown, max: number): string {
  return typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

/** Writes a title, description, tags and a quality-based emoji. Keeps anything the maker already wrote. */
export async function writeUpProject(f: ProjectFacts): Promise<ProjectWriteUp> {
  const given = { title: clean(f.title, 120), blurb: clean(f.blurb, 600), details: (f.details ?? "").trim().slice(0, 3000) };
  const fallbackTitle = given.title || titleFromUrl(f.href);
  try {
    const text = await pageText(f.href);
    const res = await generateResponse({
      model: TEXT_MODEL,
      instructions: INSTRUCTIONS,
      input: [
        {
          role: "user" as const,
          content: JSON.stringify({ link: f.href, maker: f.makerName ?? "", title_from_maker: given.title, description_from_maker: given.blurb, notes_from_maker: given.details, page: text || "(could not read the page)" }),
        },
      ],
      text: { format: { type: "json_schema", name: "project_review", schema: SCHEMA, strict: true } },
      max_output_tokens: 900,
    });
    const out = JSON.parse(textOf(res) || "{}") as Record<string, unknown>;
    const quality = Number(out["quality"]) || 2;
    const pick = pickProjectEmoji(quality, clean(out["emoji"], 8), f.href);
    const tags = Array.isArray(out["tags"]) ? (out["tags"] as unknown[]).map((t) => clean(t, 24)).filter(Boolean).slice(0, 4) : [];
    return {
      title: given.title || clean(out["title"], 120) || fallbackTitle,
      blurb: given.blurb || clean(out["blurb"], 600) || `A maths project by our club — open it and explore!`,
      details: given.details || (typeof out["details"] === "string" ? out["details"].trim().slice(0, 3000) : ""),
      tags: f.tags?.length ? f.tags : tags,
      emoji: pick.emoji,
      emoji_tier: pick.tier,
      emoji_reason: clean(out["emoji_reason"], 160),
      ai: true,
    };
  } catch (e) {
    console.error("Project write-up failed", e instanceof GatewayError ? e.code : e);
    const pick = pickProjectEmoji(2, null, f.href);
    return {
      title: fallbackTitle,
      blurb: given.blurb || `A maths project made by ${f.makerName?.split(" ")[0] ?? "our club"} — open it and explore!`,
      details: given.details,
      tags: f.tags ?? [],
      emoji: pick.emoji,
      emoji_tier: pick.tier,
      emoji_reason: "",
      ai: false,
    };
  }
}

/** Starts a short AI preview video from a live screenshot of the website. Returns the job id, or null. */
export async function startProjectVideo(p: { href: string; title: string; blurb: string; emoji: string }): Promise<string | null> {
  try {
    const shot = screenshotUrl(p.href);
    let image: { type: "image"; data: string; mime_type: string } | null = null;
    if (shot) {
      const res = await fetch(shot, { signal: AbortSignal.timeout(25_000) });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.startsWith("image/")) {
        const buf = new Uint8Array(await res.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        image = { type: "image", data: btoa(bin), mime_type: type.split(";")[0]! };
      }
    }
    const prompt = image
      ? `Animate this exact screenshot of a kids' maths website called "${p.title}" as a smooth screen-recording style preview: the page gently scrolls and zooms, buttons softly pulse as if hovered, a few small sparkles and ${p.emoji} float by. Keep all text and layout exactly as shown. No people, no new text.`
      : `A bright, friendly 6-second animated preview for a kids' maths website called "${p.title}": ${p.blurb}. Colourful shapes, numbers and ${p.emoji} gently floating, soft camera glide. No people, no text.`;
    const job = await generateVideo({
      model: VIDEO_MODEL,
      input: image ? [image, { type: "text", text: prompt }] : prompt,
      response_format: { type: "video", duration: "6s", resolution: "720p", aspect_ratio: "16:9" },
    });
    return job.status === "failed" ? null : job.id;
  } catch (e) {
    console.error("Project video start failed", e instanceof GatewayError ? e.code : e);
    return null;
  }
}

/** Checks a video job. Returns the MP4 bytes when ready, "pending" while working, or "failed". */
export async function collectProjectVideo(jobId: string): Promise<Uint8Array | "pending" | "failed"> {
  try {
    const st = (await getVideo(jobId)) as { status?: string };
    if (st.status === "failed") return "failed";
    if (st.status !== "completed") return "pending";
    const bin = await downloadVideo(jobId);
    return new Uint8Array(await (await bin.blob()).arrayBuffer());
  } catch (e) {
    console.error("Project video check failed", e instanceof GatewayError ? e.code : e);
    return "pending";
  }
}
