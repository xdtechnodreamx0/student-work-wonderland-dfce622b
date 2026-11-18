import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, KeyRound, Lock, LogIn, Search, UserRound } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Section } from "@/components/club/Bits";
import { PixelRobot } from "@/components/club/Art";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { listSignInPeople } from "@/lib/accounts.functions";
import { ROLE_EMOJI, ROLE_LABEL, SIGN_IN_HOW, canEditContent, isValidUsername, mainRole, normalizeUsername, type ClubRole } from "@/lib/accounts";
import { cn } from "@/lib/utils";

function safeRedirect(v: unknown): string | undefined {
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : undefined;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: safeRedirect(s["redirect"]) }),
  head: () => pageMeta("Sign in", "Explorers pick their name and username; the teacher, mentors and admin sign in with a password."),
  component: AuthPage,
});

const WHO: { role: ClubRole; color: string }[] = [
  { role: "student", color: "bg-fun-green-soft text-fun-green-ink" },
  { role: "mentor", color: "bg-fun-purple-soft text-fun-purple-ink" },
  { role: "teacher", color: "bg-fun-amber-soft text-fun-amber-ink" },
  { role: "admin", color: "bg-fun-blue-soft text-fun-blue-ink" },
];

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();
  const [who, setWho] = useState<ClubRole | null>(null);
  const peopleFn = useServerFn(listSignInPeople);
  const people = useQuery({ queryKey: ["sign-in-people"], queryFn: () => peopleFn(), refetchInterval: who === "student" ? 15_000 : false });

  const goHome = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user?.id ?? "");
    const roles = (data ?? []).map((r) => r.role as ClubRole);
    await navigate({ to: redirect ?? (canEditContent(roles) ? "/teacher" : "/me") });
  };

  if (auth.ready && auth.userId) {
    const role = mainRole(auth.roles);
    return (
      <>
        <PageHeader eyebrow="🔑 Sign in" emoji="👋" title="You're signed in!" />
        <Section>
          <div className="card-fun mx-auto max-w-md p-8 text-center">
            <p className="text-lg">
              Hi <strong>{auth.profile?.display_name ?? "explorer"}</strong>
              {role && (
                <>
                  {" "}
                  · {ROLE_EMOJI[role]} {ROLE_LABEL[role]}
                </>
              )}
            </p>
            {role === "student" && <p className="mt-2 text-sm text-muted-foreground">Remember to sign out when you finish, so your name is free next time.</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {canEditContent(auth.roles) && (
                <Button asChild>
                  <Link to="/teacher">Teacher page</Link>
                </Button>
              )}
              <Button asChild variant={canEditContent(auth.roles) ? "outline" : "default"}>
                <Link to="/me">My page</Link>
              </Button>
              <Button variant="ghost" onClick={() => void auth.signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="🔑 Sign in"
        emoji="🚀"
        title={who ? `${ROLE_EMOJI[who]} ${ROLE_LABEL[who]} sign in` : "Who is signing in?"}
        intro={who ? SIGN_IN_HOW[who] : "Pick the button that matches you."}
      />
      <Section>
        <div className="mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-[1fr_220px]">
          <div className="card-fun p-6 sm:p-8">
            {!who ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {WHO.map(({ role, color }) => (
                  <li key={role}>
                    <button
                      type="button"
                      onClick={() => setWho(role)}
                      className={cn("lift flex min-h-28 w-full flex-col items-start gap-1 rounded-2xl p-5 text-left", color)}
                    >
                      <span className="text-4xl" aria-hidden="true">
                        {ROLE_EMOJI[role]}
                      </span>
                      <span className="font-display text-xl font-bold">I'm {role === "admin" ? "the Admin" : role === "teacher" ? "the Teacher" : role === "student" ? "an Explorer" : "a Mentor"}</span>
                      <span className="text-sm font-semibold opacity-90">{role === "student" ? "No password needed" : "Needs a password"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <button type="button" onClick={() => setWho(null)} className="mb-5 inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                {people.isLoading && <p className="text-muted-foreground">Loading names…</p>}
                {people.isError && <p className="text-destructive">Couldn't load the names. Please refresh the page.</p>}
                {people.data &&
                  (who === "student" ? (
                    <StudentSignIn students={people.data.students} onDone={goHome} onRefresh={() => void people.refetch()} />
                  ) : (
                    <StaffSignIn people={people.data.staff.filter((s) => s.kind === who)} onDone={goHome} />
                  ))}
              </>
            )}
            <p className="mt-6 text-sm text-muted-foreground">
              Explorers: sign out when you finish so nobody else can use your name. Stuck? Ask your teacher.
            </p>
          </div>
          <PixelRobot className="mx-auto hidden h-52 w-52 animate-float md:block" waving />
        </div>
      </Section>
    </>
  );
}

function StudentSignIn({ students, onDone, onRefresh }: { students: { name: string; taken: boolean }[]; onDone: () => Promise<void>; onRefresh: () => void }) {
  const { signInStudent } = useAuth();
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return students.filter((s) => words.every((w) => s.name.toLowerCase().includes(w)));
  }, [q, students]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!picked) return;
    if (!isValidUsername(username)) return setError("Usernames need 3–24 letters or numbers (dots and dashes are fine).");
    setBusy(true);
    const err = await signInStudent(picked, username);
    if (err) {
      setError(err);
      setBusy(false);
      onRefresh();
      return;
    }
    await onDone();
  };

  if (picked) {
    return (
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="rounded-2xl bg-fun-green-soft p-4 text-fun-green-ink">
          <p className="text-sm font-bold">Your name</p>
          <p className="font-display text-2xl font-bold">{picked}</p>
          <button type="button" onClick={() => { setPicked(null); setError(null); }} className="mt-1 min-h-11 text-sm font-bold underline">
            Not you? Pick another name
          </button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="st-user" className="flex items-center gap-2 text-base font-bold">
            <UserRound className="h-4 w-4" aria-hidden="true" /> Your username
          </Label>
          <Input
            id="st-user"
            autoComplete="off"
            autoCapitalize="none"
            value={username}
            onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            maxLength={24}
            className="h-12 text-base"
            placeholder="e.g. star.coder"
          />
          <p className="text-sm text-muted-foreground">
            First time? Make up a username and remember it. Been here before? Type the same username. Don't use your full name.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-destructive/10 p-3 font-semibold text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy}>
          <LogIn className="h-5 w-5" aria-hidden="true" /> {busy ? "Signing in…" : "Let's go!"}
        </Button>
      </form>
    );
  }

  return (
    <div>
      <Label htmlFor="st-search" className="text-base font-bold">
        Find your name
      </Label>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id="st-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="h-12 pl-10 text-base" placeholder="Type part of your name" />
      </div>
      <ul className="mt-4 grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2" aria-label="Class names">
        {shown.map((s) => (
          <li key={s.name}>
            <button
              type="button"
              disabled={s.taken}
              onClick={() => setPicked(s.name)}
              className={cn(
                "flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left font-semibold transition",
                s.taken ? "cursor-not-allowed border-dashed bg-muted text-muted-foreground" : "bg-card hover:border-primary hover:bg-secondary",
              )}
            >
              <span>{s.name}</span>
              {s.taken && (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> In use
                </span>
              )}
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="text-muted-foreground">No name found. Try different letters! 🔍</li>}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">🔒 A name marked "In use" is signed in somewhere. It frees up when that explorer signs out, or when the teacher frees it.</p>
    </div>
  );
}

function StaffSignIn({ people, onDone }: { people: { id: string; kind: ClubRole; name: string }[]; onDone: () => Promise<void> }) {
  const { signInStaff } = useAuth();
  const [picked, setPicked] = useState<string | null>(people.length === 1 ? people[0]!.id : null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!picked) return setError("Please pick your name first.");
    if (!password) return setError("Please type your password.");
    setBusy(true);
    const err = await signInStaff(picked, password);
    if (err) {
      setError(err);
      setBusy(false);
      return;
    }
    await onDone();
  };

  if (people.length === 0) return <p className="text-muted-foreground">No sign-in set up for this yet.</p>;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <fieldset>
        <legend className="text-base font-bold">Pick your name</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={picked === p.id}
              onClick={() => setPicked(p.id)}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-xl border-2 px-3 py-2 text-left font-semibold transition",
                picked === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary",
              )}
            >
              <span aria-hidden="true">{ROLE_EMOJI[p.kind]}</span> {p.name}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <Label htmlFor="staff-pass" className="flex items-center gap-2 text-base font-bold">
          <KeyRound className="h-4 w-4" aria-hidden="true" /> Password
        </Label>
        <Input id="staff-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} className="h-12 text-base" />
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={busy}>
        <LogIn className="h-5 w-5" aria-hidden="true" /> {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
