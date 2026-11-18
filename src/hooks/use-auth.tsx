import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { staffSignIn, studentSignIn } from "@/lib/accounts.functions";
import type { ClubRole } from "@/lib/accounts";

type Profile = { id: string; username: string; display_name: string };

type AuthState = {
  ready: boolean;
  userId: string | null;
  profile: Profile | null;
  roles: ClubRole[];
  /** Returns an error message, or null when signed in. */
  signInStudent: (name: string, username: string) => Promise<string | null>;
  signInStaff: (id: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function message(e: unknown) {
  return e instanceof Error && e.message ? e.message : "Sign-in didn't work right now. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentFn = useServerFn(studentSignIn);
  const staffFn = useServerFn(staffSignIn);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<ClubRole[]>([]);

  const load = useCallback(async (id: string | null) => {
    setUserId(id);
    if (!id) {
      setProfile(null);
      setRoles([]);
      setReady(true);
      return;
    }
    const [p, r, active] = await Promise.all([
      supabase.from("profiles").select("id, username, display_name").eq("id", id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
      supabase.rpc("my_login_active"),
    ]);
    // A teacher or the admin freed this explorer's name: sign this device out.
    if (active.data === false) {
      await supabase.auth.signOut();
      toast.info("Your name was freed by your teacher. Please sign in again.");
      return;
    }
    setProfile(p.data ?? null);
    setRoles((r.data ?? []).map((x) => x.role as ClubRole));
    setReady(true);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Defer so the auth client finishes its own work before we query.
        setTimeout(() => void load(session?.user.id ?? null), 0);
      }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [load, router, queryClient]);

  const applyTokens = useCallback(async (t: { access_token: string; refresh_token: string }) => {
    const { error } = await supabase.auth.setSession(t);
    return error ? "Sign-in didn't work right now. Please try again." : null;
  }, []);

  const signInStudent = useCallback(
    async (name: string, username: string) => {
      try {
        return await applyTokens(await studentFn({ data: { name, username } }));
      } catch (e) {
        return message(e);
      }
    },
    [studentFn, applyTokens],
  );

  const signInStaff = useCallback(
    async (id: string, password: string) => {
      try {
        return await applyTokens(await staffFn({ data: { id, password } }));
      } catch (e) {
        return message(e);
      }
    },
    [staffFn, applyTokens],
  );

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "club-content" });
    // Free the explorer's name so it can be picked again.
    await supabase.rpc("release_my_login");
    await supabase.auth.signOut();
    await queryClient.invalidateQueries({ queryKey: ["sign-in-people"] });
    await router.navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }, [queryClient, router]);

  return (
    <AuthContext.Provider value={{ ready, userId, profile, roles, signInStudent, signInStaff, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
