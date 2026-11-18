import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { PageHeader, Section } from "@/components/club/Bits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AwardsEditor, DayNotesEditor, PhotosEditor, PlanningNotes, RosterEditor } from "@/components/teacher/ContentEditors";
import { PromptNotebooks, SignInManager } from "@/components/teacher/PeopleTools";
import { useAuth } from "@/hooks/use-auth";
import { can, canEditContent, mainRole, ROLE_EMOJI, ROLE_LABEL, type Power } from "@/lib/accounts";
import { clubContentQuery } from "@/lib/club-content";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/teacher")({
  head: () => pageMeta("Teacher page", "Private page for the teacher, mentors and admin to update the Math Blog Club site."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubContentQuery),
  component: TeacherPage,
});

const TABS: { id: string; label: string; power: Power; el: () => React.ReactNode }[] = [
  { id: "days", label: "📝 Day notes", power: "editDayNotes", el: () => <DayNotesEditor /> },
  { id: "photos", label: "📸 Photos", power: "editPhotos", el: () => <PhotosEditor /> },
  { id: "notebooks", label: "💬 Notebooks", power: "seeNotebooks", el: () => <PromptNotebooks /> },
  { id: "awards", label: "🏆 Awards", power: "editAwards", el: () => <AwardsEditor /> },
  { id: "roster", label: "🧒 Roster", power: "editRoster", el: () => <RosterEditor /> },
  { id: "signins", label: "🔑 Sign-ins", power: "seeSignIns", el: () => <SignInManager /> },
  { id: "planning", label: "📋 Planning", power: "seePlanning", el: () => <PlanningNotes /> },
];

const POWER_LINES: { power: Power; text: string }[] = [
  { power: "editDayNotes", text: "Add notes to any day (and fill in Day 6)" },
  { power: "editPhotos", text: "Upload and remove club photos" },
  { power: "seeNotebooks", text: "Read the explorers' saved prompts" },
  { power: "editAwards", text: "Choose the award winners" },
  { power: "editRoster", text: "Change the class list" },
  { power: "freeNames", text: "Free an explorer's name if they forgot to sign out" },
  { power: "resetUsernames", text: "Reset an explorer's username" },
  { power: "changePasswords", text: "Change the staff passwords" },
];

function TeacherPage() {
  const auth = useAuth();
  if (!auth.ready) return <p className="p-10 text-center text-muted-foreground">Loading…</p>;
  if (!canEditContent(auth.roles)) {
    return (
      <>
        <PageHeader eyebrow="🔒 Teacher page" emoji="🍎" title="This page is for the teacher, mentors and admin" />
        <Section>
          <div className="card-fun mx-auto max-w-md p-8 text-center">
            <p>Your own page has your prompt notebook.</p>
            <Button asChild className="mt-5">
              <Link to="/me">Go to my page</Link>
            </Button>
          </div>
        </Section>
      </>
    );
  }
  const role = mainRole(auth.roles);
  const tabs = TABS.filter((t) => can(auth.roles, t.power));

  return (
    <>
      <PageHeader
        eyebrow={`🔒 ${role ? `${ROLE_EMOJI[role]} ${ROLE_LABEL[role]}` : "Staff"} page`}
        emoji="🍎"
        title={`Welcome, ${auth.profile?.display_name ?? "teacher"}!`}
        intro="Update the site here. Changes show on the public pages straight away."
      />
      <Section>
        <div className="mx-auto max-w-5xl">
          <details className="card-fun mb-6 p-5">
            <summary className="cursor-pointer font-display text-lg font-bold">What can I do as {role ? ROLE_LABEL[role] : "staff"}?</summary>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {POWER_LINES.map((p) => {
                const ok = can(auth.roles, p.power);
                return (
                  <li key={p.power} className={ok ? "font-semibold" : "text-muted-foreground line-through"}>
                    {ok ? "✅" : "🚫"} {p.text}
                  </li>
                );
              })}
            </ul>
          </details>
          <Tabs defaultValue="days">
            <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 rounded-2xl p-1.5">
              {tabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="min-h-11 rounded-xl px-4 text-sm font-bold">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.id} value={t.id}>
                <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>{t.el()}</Suspense>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Section>
    </>
  );
}
