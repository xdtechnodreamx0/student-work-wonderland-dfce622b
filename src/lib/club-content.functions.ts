import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ClubContent = {
  dayNotes: { day: number; title: string; notes: string }[];
  winners: { award: string; winner: string }[];
  roster: { id: string; name: string }[] | null;
  photos: { id: string; path: string; caption: string; alt: string; width: number; height: number }[];
};

const EMPTY: ClubContent = { dayNotes: [], winners: [], roster: null, photos: [] };

/** Public read of the parts of the site the teacher can edit. Falls back to the built-in content on any error. */
export const getClubContent = createServerFn({ method: "GET" }).handler(async (): Promise<ClubContent> => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return EMPTY;
  const db = createClient<Database>(url, key, {
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
  try {
    const [d, w, r, p] = await Promise.all([
      db.from("day_notes").select("day, title, notes").order("day"),
      db.from("award_winners").select("award, winner"),
      db.from("roster_members").select("id, name").order("sort_order").order("created_at"),
      db.from("club_photos").select("id, path, caption, alt, width, height").order("created_at"),
    ]);
    return {
      dayNotes: d.data ?? [],
      winners: w.data ?? [],
      roster: r.error ? null : (r.data ?? []),
      photos: p.data ?? [],
    };
  } catch {
    return EMPTY;
  }
});
