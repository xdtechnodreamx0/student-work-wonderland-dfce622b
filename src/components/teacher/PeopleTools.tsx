import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { KeyRound, RotateCcw, Unlock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { freeAllStudentNames, freeStudentName, listClubLogins, resetStudentUsername, setStaffPassword } from "@/lib/accounts.functions";
import { MIN_PASSWORD, ROLE_EMOJI, ROLE_LABEL, can, isValidPassword } from "@/lib/accounts";
import { useAuth } from "@/hooks/use-auth";
import { Panel } from "@/components/teacher/ContentEditors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function when(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

/* ---------------- Who's signed in (teacher + admin) ---------------- */

export function SignInManager() {
  const qc = useQueryClient();
  const { profile, roles } = useAuth();
  const listFn = useServerFn(listClubLogins);
  const freeFn = useServerFn(freeStudentName);
  const freeAllFn = useServerFn(freeAllStudentNames);
  const resetFn = useServerFn(resetStudentUsername);
  const pwFn = useServerFn(setStaffPassword);
  const logins = useQuery({ queryKey: ["club-logins"], queryFn: () => listFn(), refetchInterval: 20_000 });
  const [pwFor, setPwFor] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const isAdmin = can(roles, "changePasswords");

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["club-logins"] });
    void qc.invalidateQueries({ queryKey: ["sign-in-people"] });
  };
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That didn't work.");
    }
  };

  const signedIn = logins.data?.students.filter((s) => s.signedIn).length ?? 0;

  return (
    <div className="space-y-6">
      <Panel
        title="Explorers' names"
        intro="A name stays locked while an explorer is signed in. Free it if they forgot to sign out. Their old device signs out next time it opens the site."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            <Users className="mr-1 inline h-4 w-4" aria-hidden="true" /> {signedIn} of {logins.data?.students.length ?? "…"} signed in now
          </p>
          {can(roles, "freeAllNames") && signedIn > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Free every explorer's name? Everyone will need to sign in again.")) void run(() => freeAllFn(), "All names are free");
              }}
            >
              <Unlock className="h-4 w-4" /> Free all names
            </Button>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-2">Explorer</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logins.isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-muted-foreground">Loading…</td>
                </tr>
              )}
              {logins.data?.students.map((s) => (
                <tr key={s.name}>
                  <td className="px-4 py-2 font-semibold">{s.name}</td>
                  <td className="px-4 py-2">
                    {s.signedIn ? (
                      <span className="rounded-full bg-fun-green-soft px-2 py-0.5 font-bold text-fun-green-ink">🟢 Signed in {when(s.since)}</span>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono">{isAdmin ? (s.username ?? "—") : s.hasUsername ? "made ✓" : "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-1">
                      {s.id && s.signedIn && (
                        <Button size="sm" variant="ghost" onClick={() => void run(() => freeFn({ data: { id: s.id! } }), `${s.name.split(" ")[0]}'s name is free`)}>
                          <Unlock className="h-4 w-4" /> Free name
                        </Button>
                      )}
                      {isAdmin && s.id && s.hasUsername && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm(`Reset ${s.name}'s username? They will make a new one next time.`))
                              void run(() => resetFn({ data: { id: s.id! } }), "Username reset");
                          }}
                        >
                          <RotateCcw className="h-4 w-4" /> Reset username
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {isAdmin ? (
        <Panel title="Staff passwords" intro="Only the admin sees this. Change a password, then tell that person the new one in person.">
          <ul className="divide-y rounded-2xl border">
            {logins.data?.staff.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="font-semibold">
                  {ROLE_EMOJI[p.kind]} {p.name} <span className="text-sm text-muted-foreground">· {ROLE_LABEL[p.kind]}</span>
                </span>
                {pwFor === p.id ? (
                  <span className="flex items-center gap-2">
                    <Input value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" aria-label={`New password for ${p.name}`} className="h-9 w-44" autoComplete="off" />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!isValidPassword(newPw)) return void toast.error(`Passwords need at least ${MIN_PASSWORD} characters.`);
                        void run(() => pwFn({ data: { id: p.id, password: newPw } }), "Password changed").then(() => {
                          setPwFor(null);
                          setNewPw("");
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPwFor(null)}>
                      Cancel
                    </Button>
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setPwFor(p.id); setNewPw(""); }}>
                    <KeyRound className="h-4 w-4" /> Change password
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        (() => {
          const myStaff = logins.data?.staff.find((p) => p.name === profile?.display_name);
          if (!myStaff) return null;
          return (
            <Panel title="My password" intro="Change your password for signing into the club website.">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
                <span className="font-semibold">
                  {ROLE_EMOJI[myStaff.kind]} {myStaff.name} <span className="text-sm text-muted-foreground">· {ROLE_LABEL[myStaff.kind]}</span>
                </span>
                {pwFor === myStaff.id ? (
                  <span className="flex items-center gap-2">
                    <Input value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" aria-label={`New password for ${myStaff.name}`} className="h-9 w-44" autoComplete="off" />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!isValidPassword(newPw)) return void toast.error(`Passwords need at least ${MIN_PASSWORD} characters.`);
                        void run(() => pwFn({ data: { id: myStaff.id, password: newPw } }), "Password changed").then(() => {
                          setPwFor(null);
                          setNewPw("");
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPwFor(null)}>
                      Cancel
                    </Button>
                  </span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setPwFor(myStaff.id); setNewPw(""); }}>
                    <KeyRound className="h-4 w-4" /> Change my password
                  </Button>
                )}
              </div>
            </Panel>
          );
        })()
      )}
    </div>
  );
}

/* ---------------- Explorers' prompt notebooks ---------------- */

export function PromptNotebooks() {
  const prompts = useQuery({
    queryKey: ["all-prompts"],
    queryFn: async () => {
      const [p, people] = await Promise.all([
        supabase.from("student_prompts").select("id, user_id, prompt, stars, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("profiles").select("id, display_name"),
      ]);
      if (p.error) throw p.error;
      return (p.data ?? []).map((x) => ({ ...x, name: people.data?.find((y) => y.id === x.user_id)?.display_name ?? "Explorer" }));
    },
  });

  return (
    <Panel title="Prompt notebooks" intro="Prompts the explorers saved on their own page, newest first.">
      <ul className="space-y-3">
        {prompts.data?.length === 0 && <li className="text-muted-foreground">No saved prompts yet.</li>}
        {prompts.data?.map((p) => (
          <li key={p.id} className="rounded-2xl bg-muted/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-bold">{p.name}</span>
              <span aria-label={`${p.stars} of 6 stars`}>{"⭐".repeat(p.stars) || "—"}</span>
            </div>
            <p className="mt-1">{p.prompt}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
