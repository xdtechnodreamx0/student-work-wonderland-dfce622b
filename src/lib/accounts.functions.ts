import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { MIN_PASSWORD, NAME_TAKEN_MESSAGE, can, isValidUsername, normalizeUsername, type ClubRole, type Power } from "@/lib/accounts";
import { ROSTER } from "@/lib/club-data";

type LoginRow = {
  id: string;
  kind: ClubRole;
  display_name: string;
  user_id: string | null;
  username: string | null;
  signed_in: boolean;
  failed_attempts: number;
  blocked_until: string | null;
};
const ROW_COLS = "id, kind, display_name, user_id, username, signed_in, failed_attempts, blocked_until";
const MAX_TRIES = 5;
const BLOCK_MINUTES = 5;

async function adminDb() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

function randomSecret() {
  const b = new Uint8Array(24);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

async function currentRoster(): Promise<string[]> {
  const db = await adminDb();
  const { data, error } = await db.from("roster_members").select("name").order("sort_order").order("created_at");
  if (error || !data) return ROSTER;
  return data.map((r) => r.name);
}

function isBlocked(row: LoginRow) {
  return !!row.blocked_until && new Date(row.blocked_until).getTime() > Date.now();
}

async function noteFailedTry(row: LoginRow) {
  const db = await adminDb();
  const tries = row.failed_attempts + 1;
  await db
    .from("club_logins")
    .update(
      tries >= MAX_TRIES
        ? { failed_attempts: 0, blocked_until: new Date(Date.now() + BLOCK_MINUTES * 60_000).toISOString() }
        : { failed_attempts: tries },
    )
    .eq("id", row.id);
}

/** Makes sure the person has a club account, gives it a fresh secret and returns a signed-in session. */
async function openSession(row: LoginRow, profileUsername: string) {
  const db = await adminDb();
  const email = `${row.kind}-${row.id}@mathblogclub.local`;
  const secret = randomSecret();
  let userId = row.user_id;
  if (userId) {
    const { error } = await db.auth.admin.updateUserById(userId, { password: secret });
    if (error) userId = null;
  }
  if (!userId) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: secret,
      email_confirm: true,
      user_metadata: { display_name: row.display_name },
    });
    if (error || !data.user) throw new Error("Could not open your club page right now. Please try again.");
    userId = data.user.id;
    await db.from("club_logins").update({ user_id: userId }).eq("id", row.id);
  }
  const { error: pErr } = await db.from("profiles").upsert({ id: userId, username: profileUsername, display_name: row.display_name });
  if (pErr) throw new Error("Could not open your club page right now. Please try again.");
  await db.from("user_roles").upsert({ user_id: userId, role: row.kind }, { onConflict: "user_id,role", ignoreDuplicates: true });

  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const pub = createClient<Database>(url, key, {
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
  const { data: authUser } = await db.auth.admin.getUserById(userId);
  const { data: s, error: sErr } = await pub.auth.signInWithPassword({ email: authUser.user?.email ?? email, password: secret });
  if (sErr || !s.session) throw new Error("Could not sign you in right now. Please try again in a minute.");
  return { access_token: s.session.access_token, refresh_token: s.session.refresh_token };
}

/* ---------------- Public: the sign-in page ---------------- */

/** Names for the sign-in page: staff to pick from, and explorers with whether their name is already in use. */
export const listSignInPeople = createServerFn({ method: "GET" }).handler(async () => {
  const db = await adminDb();
  const [{ data: rows }, roster] = await Promise.all([
    db.from("club_logins").select("id, kind, display_name, signed_in, sort_order").order("sort_order"),
    currentRoster(),
  ]);
  const all = rows ?? [];
  return {
    staff: all.filter((r) => r.kind !== "student").map((r) => ({ id: r.id, kind: r.kind as ClubRole, name: r.display_name })),
    students: roster.map((name) => ({
      name,
      taken: all.some((r) => r.kind === "student" && r.display_name === name && r.signed_in),
    })),
  };
});

/** Explorers: pick a name, then create (first time) or type (next times) a username. No password. */
export const studentSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ name: z.string().trim().min(1).max(80), username: z.string().max(40) }).parse(input))
  .handler(async ({ data }) => {
    const uname = normalizeUsername(data.username);
    if (!isValidUsername(uname)) throw new Error("Usernames need 3–24 letters or numbers (dots and dashes are fine).");
    const db = await adminDb();
    const name = (await currentRoster()).find((n) => n.toLowerCase() === data.name.toLowerCase());
    if (!name) throw new Error("That name isn't on the class list.");

    let { data: row } = await db.from("club_logins").select(ROW_COLS).eq("kind", "student").eq("display_name", name).maybeSingle<LoginRow>();
    if (!row) {
      await db.from("club_logins").insert({ kind: "student", display_name: name });
      ({ data: row } = await db.from("club_logins").select(ROW_COLS).eq("kind", "student").eq("display_name", name).maybeSingle<LoginRow>());
    }
    if (!row) throw new Error("Could not sign you in right now. Please try again.");
    if (isBlocked(row)) throw new Error("Too many tries. Wait a few minutes or ask your teacher.");
    if (row.signed_in) throw new Error(NAME_TAKEN_MESSAGE);

    const firstTime = !row.username;
    if (!firstTime && row.username !== uname) {
      await noteFailedTry(row);
      throw new Error("That isn't the username for this name. Forgot it? Ask the admin to reset it.");
    }
    if (firstTime) {
      const [{ data: clash }, { data: pClash }] = await Promise.all([
        db.from("club_logins").select("id").eq("username", uname).neq("id", row.id).maybeSingle(),
        db.from("profiles").select("id").eq("username", uname).maybeSingle(),
      ]);
      if (clash || (pClash && pClash.id !== row.user_id)) throw new Error("Someone already uses that username. Try another one!");
    }

    // Claim the name in one step so two people can't sign in with it at the same time.
    const { data: claimed, error: claimErr } = await db
      .from("club_logins")
      .update({ signed_in: true, signed_in_at: new Date().toISOString(), username: uname, failed_attempts: 0, blocked_until: null })
      .eq("id", row.id)
      .eq("signed_in", false)
      .select("id")
      .maybeSingle();
    if (claimErr?.code === "23505") throw new Error("Someone already uses that username. Try another one!");
    if (!claimed) throw new Error(NAME_TAKEN_MESSAGE);

    try {
      const session = await openSession({ ...row, username: uname }, uname);
      return { ...session, firstTime };
    } catch (e) {
      await db.from("club_logins").update({ signed_in: false, ...(firstTime ? { username: null } : {}) }).eq("id", row.id);
      throw e;
    }
  });

/** Teacher, mentors and admin: pick a name, then type the password. */
export const staffSignIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), password: z.string().min(1).max(72) }).parse(input))
  .handler(async ({ data }) => {
    const db = await adminDb();
    const { data: row } = await db.from("club_logins").select(ROW_COLS).eq("id", data.id).neq("kind", "student").maybeSingle<LoginRow>();
    if (!row) throw new Error("Please pick your name from the list.");
    if (isBlocked(row)) throw new Error(`Too many wrong tries. Please wait ${BLOCK_MINUTES} minutes.`);
    const { data: ok } = await db.rpc("check_login_password", { _id: row.id, _password: data.password });
    if (!ok) {
      await noteFailedTry(row);
      throw new Error("That password doesn't match. Please try again.");
    }
    await db.from("club_logins").update({ signed_in: true, signed_in_at: new Date().toISOString(), failed_attempts: 0, blocked_until: null }).eq("id", row.id);
    // "@" can never be typed into an explorer username, so staff handles never clash with them.
    return openSession(row, `@${row.kind}.${row.id.slice(0, 8)}`);
  });

/* ---------------- Teacher and admin tools ---------------- */

async function requirePower(supabase: SupabaseClient<Database>, userId: string, power: Power) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as ClubRole);
  if (!can(roles, power)) throw new Error("You don't have permission to do that.");
  return roles;
}

export const listClubLogins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await requirePower(context.supabase, context.userId, "seeSignIns");
    const db = await adminDb();
    const [{ data }, roster] = await Promise.all([
      db.from("club_logins").select("id, kind, display_name, username, signed_in, signed_in_at, sort_order").order("sort_order").order("display_name"),
      currentRoster(),
    ]);
    const rows = data ?? [];
    const showUsernames = can(roles, "resetUsernames");
    return {
      staff: rows.filter((r) => r.kind !== "student").map((r) => ({ id: r.id, kind: r.kind as ClubRole, name: r.display_name, signedIn: r.signed_in, since: r.signed_in_at })),
      students: roster.map((name) => {
        const r = rows.find((x) => x.kind === "student" && x.display_name === name);
        return {
          id: r?.id ?? null,
          name,
          hasUsername: !!r?.username,
          username: showUsernames ? (r?.username ?? null) : null,
          signedIn: !!r?.signed_in,
          since: r?.signed_in_at ?? null,
        };
      }),
    };
  });

export const freeStudentName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "freeNames");
    const db = await adminDb();
    const { error } = await db.from("club_logins").update({ signed_in: false, failed_attempts: 0, blocked_until: null }).eq("id", data.id).eq("kind", "student");
    if (error) throw new Error("Could not free that name.");
    return { ok: true };
  });

export const freeAllStudentNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requirePower(context.supabase, context.userId, "freeAllNames");
    const db = await adminDb();
    const { error } = await db.from("club_logins").update({ signed_in: false, failed_attempts: 0, blocked_until: null }).eq("kind", "student");
    if (error) throw new Error("Could not free the names.");
    return { ok: true };
  });

export const resetStudentUsername = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "resetUsernames");
    const db = await adminDb();
    const { error } = await db.from("club_logins").update({ username: null, signed_in: false, failed_attempts: 0, blocked_until: null }).eq("id", data.id).eq("kind", "student");
    if (error) throw new Error("Could not reset that username.");
    return { ok: true };
  });

export const setStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), password: z.string().min(MIN_PASSWORD, `Passwords need at least ${MIN_PASSWORD} characters.`).max(72) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requirePower(context.supabase, context.userId, "changePasswords");
    const db = await adminDb();
    const { error } = await db.rpc("set_login_password", { _id: data.id, _password: data.password });
    if (error) throw new Error("Could not change the password.");
    return { ok: true };
  });
