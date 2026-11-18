import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { can, mainRole, type ClubRole, type Power } from "@/lib/accounts";
import { fallbackProjects, normalizeProjectUrl, PROJECT_COLUMNS, PROJECT_MEDIA_BUCKET, screenshotUrl, type ClubProject, type MakerCredentials } from "@/lib/projects";

type Db = SupabaseClient<Database>;

function publicDb(): Db | null {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function adminDb() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

async function rolesOf(supabase: Db, userId: string): Promise<ClubRole[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role as ClubRole);
}

async function requirePower(supabase: Db, userId: string, power: Power) {
  const roles = await rolesOf(supabase, userId);
  if (!can(roles, power)) throw new Error("You don't have permission to do that.");
  return roles;
}

export type ProjectsPayload = { projects: ClubProject[]; credentials: Record<string, MakerCredentials> };

/** Public list of every project plus each explorer-maker's Learning Path facts. */
export const listProjects = createServerFn({ method: "GET" }).handler(async (): Promise<ProjectsPayload> => {
  const db = publicDb();
  if (!db) return { projects: fallbackProjects(), credentials: {} };
  const [{ data, error }, ranks] = await Promise.all([db.from("club_projects").select(PROJECT_COLUMNS), db.rpc("public_rankings")]);
  if (error) {
    console.error("projects", error.message);
    return { projects: fallbackProjects(), credentials: {} };
  }
  const credentials: Record<string, MakerCredentials> = {};
  for (const r of ranks.data ?? []) credentials[r.display_name] = { level_count: r.level_count, score: r.score, top_emoji: r.top_emoji, certificates: r.certificates };
  return { projects: (data ?? []) as unknown as ClubProject[], credentials };
});

/** Pixel writes up a project and (for real websites) starts its preview video. Uses the service role after the caller was checked. */
async function enrich(id: string, opts: { overwrite: boolean; video: boolean; keepTitle?: boolean }) {
  const db = await adminDb();
  const { data: row } = await db.from("club_projects").select("id, href, title, blurb, details, maker_name, tags, media_key").eq("id", id).maybeSingle();
  if (!row) return;
  await db.from("club_projects").update({ ai_status: "pending" }).eq("id", id);
  const { writeUpProject, startProjectVideo } = await import("@/lib/project-ai.server");
  const w = await writeUpProject({
    href: row.href,
    makerName: row.maker_name,
    ...(opts.overwrite ? { title: row.title } : { ...(opts.keepTitle === false ? {} : { title: row.title }), blurb: row.blurb, details: row.details, tags: row.tags }),
  });
  const update: Database["public"]["Tables"]["club_projects"]["Update"] = {
    title: w.title,
    blurb: w.blurb,
    details: w.details,
    tags: w.tags,
    emoji: w.emoji,
    emoji_tier: w.emoji_tier,
    emoji_reason: w.emoji_reason,
    ai_status: w.ai ? "done" : "failed",
    poster_url: screenshotUrl(row.href),
  };
  if (opts.video && !row.media_key && row.href.startsWith("https://")) {
    const job = await startProjectVideo({ href: row.href, title: w.title, blurb: w.blurb, emoji: w.emoji });
    update.video_job_id = job;
    update.video_status = job ? "pending" : "failed";
  }
  await db.from("club_projects").update(update).eq("id", id);
}

const addSchema = z.object({
  href: z.string().trim().min(3).max(300),
  title: z.string().trim().max(120).optional().default(""),
  blurb: z.string().trim().max(600).optional().default(""),
  details: z.string().trim().max(3000).optional().default(""),
  section: z.enum(["team", "extra", "student"]).optional().default("student"),
  makerName: z.string().trim().max(80).optional().default(""),
});

/** Anyone signed in can add a project. Explorers' projects always go to Student Projects with their own name. */
export const addProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => addSchema.parse(d))
  .handler(async ({ data, context }) => {
    const roles = await requirePower(context.supabase, context.userId, "addProjects");
    const href = normalizeProjectUrl(data.href);
    if (!href) throw new Error("Please paste a full website link, like https://my-project.lovable.app");
    const staff = can(roles, "editProjects");
    const { data: me } = await context.supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle();
    const placeholderTitle = data.title || "New project";
    const { data: row, error } = await context.supabase
      .from("club_projects")
      .insert({
        href,
        title: placeholderTitle,
        blurb: data.blurb,
        details: data.details,
        section: staff ? data.section : "student",
        kind: href.startsWith("/projects/") ? "handmade" : "live",
        maker_id: staff && data.makerName ? null : context.userId,
        maker_name: staff && data.makerName ? data.makerName : (me?.display_name ?? ""),
        maker_role: staff && data.makerName ? "student" : (mainRole(roles) ?? ""),
        ai_status: "pending",
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("addProject", error?.message);
      throw new Error("Couldn't add the project right now. Please try again.");
    }
    // Keep what the maker typed; Pixel only fills the gaps (title, description, tags, emoji) and makes the video.
    await enrich(row.id, { overwrite: false, video: true, keepTitle: !!data.title });
    return { id: row.id };
  });

const editSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  emoji: z.string().trim().min(1).max(8),
  blurb: z.string().trim().max(600),
  details: z.string().trim().max(3000),
  href: z.string().trim().min(3).max(300),
  section: z.enum(["team", "extra", "student"]),
  group_name: z.string().trim().max(80),
  members: z.string().trim().max(300),
  credit: z.string().trim().max(160),
  tags: z.array(z.string().trim().min(1).max(24)).max(6),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(1000),
});

/** Mentors, teacher and admin can change any project: words, links, section, group and order. */
export const updateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => editSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "editProjects");
    const href = normalizeProjectUrl(data.href);
    if (!href) throw new Error("That link doesn't look right. Use a full https:// website link.");
    const { id, ...rest } = data;
    const { error } = await context.supabase.from("club_projects").update({ ...rest, href, kind: href.startsWith("/projects/") ? "handmade" : "live" }).eq("id", id);
    if (error) throw new Error("Couldn't save the changes. Please try again.");
    return { ok: true };
  });

/** Only the admin can delete a project. */
export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "deleteProjects");
    const { data: row } = await context.supabase.from("club_projects").select("video_path").eq("id", data.id).maybeSingle();
    const { error, count } = await context.supabase.from("club_projects").delete({ count: "exact" }).eq("id", data.id);
    if (error || !count) throw new Error("Couldn't delete that project.");
    if (row?.video_path) await (await adminDb()).storage.from(PROJECT_MEDIA_BUCKET).remove([row.video_path]);
    return { ok: true };
  });

/** Staff: ask Pixel to rewrite the description and emoji, and/or make a new preview video. */
export const refreshProjectAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), rewrite: z.boolean(), video: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "editProjects");
    if (data.rewrite) {
      await enrich(data.id, { overwrite: true, video: data.video });
    } else if (data.video) {
      const db = await adminDb();
      const { data: row } = await db.from("club_projects").select("href, title, blurb, emoji").eq("id", data.id).maybeSingle();
      if (!row || !row.href.startsWith("https://")) throw new Error("Videos can only be made for real website links.");
      const { startProjectVideo } = await import("@/lib/project-ai.server");
      const job = await startProjectVideo(row);
      if (!job) throw new Error("Pixel couldn't start the video right now. Please try again later.");
      await db.from("club_projects").update({ video_job_id: job, video_status: "pending", media_key: null }).eq("id", data.id);
    }
    return { ok: true };
  });

const VIDEO_GIVE_UP_MS = 3 * 60 * 60_000;

/** Public and safe to call often: finishes any preview videos that are ready. Only touches rows already waiting for a video. */
export const checkProjectVideos = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ ids: z.array(z.string().uuid()).max(12) }).parse(d))
  .handler(async ({ data }) => {
    if (!data.ids.length) return { ready: [] as string[] };
    const db = await adminDb();
    const { data: rows } = await db.from("club_projects").select("id, video_job_id, updated_at").in("id", data.ids).eq("video_status", "pending");
    const { collectProjectVideo } = await import("@/lib/project-ai.server");
    const ready: string[] = [];
    for (const r of rows ?? []) {
      if (!r.video_job_id || Date.now() - new Date(r.updated_at).getTime() > VIDEO_GIVE_UP_MS) {
        await db.from("club_projects").update({ video_status: "failed" }).eq("id", r.id).eq("video_status", "pending");
        continue;
      }
      const out = await collectProjectVideo(r.video_job_id);
      if (out === "pending") continue;
      if (out === "failed") {
        await db.from("club_projects").update({ video_status: "failed" }).eq("id", r.id).eq("video_job_id", r.video_job_id);
        continue;
      }
      const path = `${r.id}/${r.video_job_id}.mp4`;
      const { error } = await db.storage.from(PROJECT_MEDIA_BUCKET).upload(path, out, { contentType: "video/mp4", upsert: true });
      if (error) {
        console.error("video upload", error.message);
        continue;
      }
      await db.from("club_projects").update({ video_status: "ready", video_path: path, media_key: null }).eq("id", r.id).eq("video_job_id", r.video_job_id);
      ready.push(r.id);
    }
    return { ready };
  });
