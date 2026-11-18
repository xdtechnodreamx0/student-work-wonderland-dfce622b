import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, ExternalLink, Pencil, Play, Plus, X } from "lucide-react";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { ProjectPreview } from "@/components/projects/ProjectPreview";
import { AddProjectDialog, EditProjectDialog } from "@/components/projects/ProjectDialogs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { can, ROLE_EMOJI, ROLE_LABEL, type ClubRole } from "@/lib/accounts";
import { CONFIG } from "@/lib/club-data";
import { LEVELS } from "@/lib/learning-data";
import { tierLabel } from "@/lib/luck";
import { SECTIONS, sortProjects, tierForQuality, type ClubProject, type MakerCredentials } from "@/lib/projects";
import { checkProjectVideos } from "@/lib/projects.functions";
import { projectsQuery, useProjectVideoLinks } from "@/lib/projects-query";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => pageMeta("Projects", "Websites made by the Math Blog Club team and our explorers — watch a moving preview, read about each one and open it."),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: Projects,
});

const TIER_STYLE: Record<string, string> = {
  common: "bg-muted text-foreground",
  rare: "bg-fun-blue-soft text-fun-blue-ink",
  epic: "bg-fun-purple-soft text-fun-purple-ink",
  legendary: "bg-fun-amber-soft text-fun-amber-ink",
};

function tierRank(id: string) {
  return { common: 1, rare: 2, epic: 3, legendary: 4 }[id] ?? 1;
}

/** Finishes AI preview videos in the background while the page is open. */
function useVideoWatcher(projects: ClubProject[]) {
  const qc = useQueryClient();
  const check = useServerFn(checkProjectVideos);
  const pending = projects.filter((p) => p.video_status === "pending").map((p) => p.id);
  const key = pending.join(",");
  useEffect(() => {
    if (!key) return;
    let stop = false;
    const tick = async () => {
      try {
        const { ready } = await check({ data: { ids: key.split(",").slice(0, 12) } });
        if (!stop) await qc.invalidateQueries({ queryKey: ["club-projects"] });
        void ready;
      } catch {
        /* try again next tick */
      }
    };
    const t = setInterval(() => void tick(), 15_000);
    void tick();
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [key, check, qc]);
}

function Projects() {
  const { data } = useSuspenseQuery(projectsQuery);
  const auth = useAuth();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ClubProject | null>(null);
  const [playing, setPlaying] = useState<ClubProject | null>(null);
  const canAdd = !!auth.userId && can(auth.roles, "addProjects");
  const canEdit = can(auth.roles, "editProjects");
  useVideoWatcher(data.projects);

  const paths = useMemo(() => data.projects.filter((p) => !p.media_key && p.video_path).map((p) => p.video_path!), [data.projects]);
  const links = useProjectVideoLinks(paths).data ?? {};
  const bySection = useMemo(() => {
    const sorted = sortProjects(data.projects);
    return Object.fromEntries(SECTIONS.map((s) => [s.id, sorted.filter((p) => p.section === s.id)])) as Record<string, ClubProject[]>;
  }, [data.projects]);

  const cardProps = { links, credentials: data.credentials, canEdit, onEdit: setEditing, onPlay: setPlaying };

  return (
    <>
      <PageHeader
        eyebrow="🚀 Projects"
        emoji="💻"
        title="Websites made by our club"
        intro="Real websites built by our team and our explorers. Watch the moving preview, read what Pixel found, then open one and play!"
      />
      <Section className="pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-3xl border bg-card p-5 shadow-sm">
          <div>
            <p className="font-display text-xl font-bold">Made a maths website? Share it! 🌟</p>
            <p className="text-muted-foreground">Paste the link — Pixel writes the description, picks an emoji and makes a moving preview.</p>
          </div>
          {canAdd ? (
            <Button variant="hero" size="lg" onClick={() => setAdding(true)}><Plus /> Add a project</Button>
          ) : (
            <Button asChild variant="soft" size="lg"><Link to="/auth" search={{ redirect: "/projects" }}>Sign in to add yours</Link></Button>
          )}
        </div>
      </Section>

      {SECTIONS.map((s) => {
        const list = bySection[s.id] ?? [];
        if (!list.length && s.id === "extra") return null;
        const featured = s.id === "team" ? list.find((p) => p.featured) : undefined;
        const rest = featured ? list.filter((p) => p !== featured) : list;
        return (
          <Section key={s.id}>
            <div className="mx-auto max-w-6xl">
              <Reveal className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wide text-primary">{s.eyebrow}</p>
                <h2 className="text-3xl font-bold sm:text-4xl">{s.title}</h2>
                <p className="mt-1 text-muted-foreground">{s.intro}</p>
              </Reveal>
              {featured && <FeaturedCard p={featured} {...cardProps} />}
              {rest.length ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <Reveal key={p.id} delay={Math.min(i, 5) * 80}>
                      <ProjectCard p={p} {...cardProps} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="dashed-paper rounded-3xl p-8 text-center">
                  <p className="text-4xl" aria-hidden="true">🌱</p>
                  <p className="mt-2 font-display text-xl font-bold">No student projects yet</p>
                  <p className="text-muted-foreground">Be the first explorer to add one!</p>
                </div>
              )}
            </div>
          </Section>
        );
      })}

      <AddProjectDialog open={adding} onOpenChange={setAdding} />
      {editing && <EditProjectDialog project={editing} onClose={() => setEditing(null)} />}
      {playing && <Player p={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}

type CardProps = {
  p: ClubProject;
  links: Record<string, string>;
  credentials: Record<string, MakerCredentials>;
  canEdit: boolean;
  onEdit: (p: ClubProject) => void;
  onPlay: (p: ClubProject) => void;
};

function EmojiBadge({ p }: { p: ClubProject }) {
  const tier = tierForQuality(tierRank(p.emoji_tier));
  return (
    <span title={p.emoji_reason || undefined} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", TIER_STYLE[tier.id])}>
      <span aria-hidden="true">{p.emoji}</span> {tierLabel(tier.rank)} emoji
    </span>
  );
}

function OpenButtons({ p, onPlay }: { p: ClubProject; onPlay: (p: ClubProject) => void }) {
  if (p.kind === "handmade") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onPlay(p)}><Play /> Play it here</Button>
        <Button asChild variant="outline"><a href={p.href} target="_blank" rel="noopener noreferrer">New tab <ExternalLink /></a></Button>
      </div>
    );
  }
  return (
    <Button asChild className="w-fit">
      <a href={p.href} target="_blank" rel="noopener noreferrer">Open website <ExternalLink /></a>
    </Button>
  );
}

/** The maker's name and credentials, shown on every explorer's project. */
function MakerCard({ p, cred }: { p: ClubProject; cred: MakerCredentials | undefined }) {
  if (!p.maker_name) return null;
  const role = (["admin", "teacher", "mentor", "student"].includes(p.maker_role) ? p.maker_role : "student") as ClubRole;
  const levels = cred ? (LEVELS[cred.level_count]?.name ?? "Professional") : null;
  return (
    <div className="rounded-2xl border bg-secondary/60 p-3 text-sm">
      <p className="flex items-center gap-2 font-display text-base font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-primary-foreground" aria-hidden="true">{p.maker_name[0]}</span>
        {p.maker_name}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5 font-semibold text-muted-foreground">
        <li className="rounded-full bg-card px-2 py-0.5">{ROLE_EMOJI[role]} {ROLE_LABEL[role]}</li>
        {role === "student" && <li className="rounded-full bg-card px-2 py-0.5">🏫 {CONFIG.classLabel}</li>}
        {cred && levels && <li className="rounded-full bg-card px-2 py-0.5">🎓 {levels} level</li>}
        {cred && <li className="rounded-full bg-card px-2 py-0.5">⭐ {cred.score} pts</li>}
        {cred?.top_emoji && <li className="rounded-full bg-card px-2 py-0.5">{cred.top_emoji} best emoji</li>}
        {cred && cred.certificates > 0 && <li className="rounded-full bg-card px-2 py-0.5">📜 {cred.certificates} certificate{cred.certificates > 1 ? "s" : ""}</li>}
        <li className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</li>
      </ul>
    </div>
  );
}

function Extras({ p }: { p: ClubProject }) {
  return (
    <>
      {(p.group_name || p.members) && (
        <p className="text-sm font-semibold">
          {p.group_name && <span>👥 {p.group_name}</span>}
          {p.group_name && p.members && " · "}
          {p.members && <span className="text-muted-foreground">{p.members}</span>}
        </p>
      )}
      {p.credit && <p className="font-semibold">👩‍🏫 {p.credit}</p>}
      {p.details && (
        <details className="rounded-xl bg-muted px-3 py-2 text-sm">
          <summary className="cursor-pointer font-bold">Read more</summary>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">{p.details}</p>
        </details>
      )}
    </>
  );
}

function FeaturedCard({ p, links, credentials, canEdit, onEdit, onPlay }: CardProps) {
  return (
    <Reveal>
      <article className="mb-10 grid overflow-hidden rounded-3xl border bg-card shadow-lift lg:grid-cols-2">
        <ProjectPreview p={p} videoLink={p.video_path ? links[p.video_path] : undefined} className="h-full lg:aspect-auto" />
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-fit rounded-full bg-fun-pink-soft px-3 py-1 text-sm font-bold text-fun-pink-ink">⭐ Featured project</span>
            <EmojiBadge p={p} />
          </div>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">{p.emoji} {p.title}</h3>
          <p className="text-muted-foreground">{p.blurb}</p>
          <Extras p={p} />
          <MakerCard p={p} cred={credentials[p.maker_name]} />
          <Tags tags={p.tags} />
          <div className="flex flex-wrap gap-2">
            <OpenButtons p={p} onPlay={onPlay} />
            {canEdit && <Button variant="ghost" onClick={() => onEdit(p)}><Pencil /> Edit</Button>}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function ProjectCard({ p, links, credentials, canEdit, onEdit, onPlay }: CardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <ProjectPreview p={p} videoLink={p.video_path ? links[p.video_path] : undefined} />
        <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow", p.kind === "live" ? "bg-fun-green text-primary-foreground" : "bg-fun-amber text-foreground")}>
          {p.kind === "live" ? "🌐 Live website" : "✋ Handmade page"}
        </span>
        {canEdit && (
          <Button size="icon" variant="secondary" onClick={() => onEdit(p)} aria-label={`Edit ${p.title}`} className="absolute right-3 top-3 h-9 w-9 shadow">
            <Pencil />
          </Button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <EmojiBadge p={p} />
        <h3 className="font-display text-xl font-bold">{p.emoji} {p.title}</h3>
        <p className="flex-1 text-muted-foreground">{p.blurb || "Pixel is writing about this project…"}</p>
        <Extras p={p} />
        <MakerCard p={p} cred={credentials[p.maker_name]} />
        <Tags tags={p.tags} />
        <OpenButtons p={p} onPlay={onPlay} />
      </div>
    </article>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => <li key={t} className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{t}</li>)}
    </ul>
  );
}

function Player({ p, onClose }: { p: ClubProject; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={p.title} className="fixed inset-0 z-[80] flex flex-col bg-foreground/80 p-2 sm:p-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-card shadow-lift">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2">
          <p className="font-display text-lg font-bold">{p.emoji} {p.title}</p>
          <Button ref={closeRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close project"><X /></Button>
        </div>
        <iframe src={p.href} title={p.title} sandbox="allow-scripts allow-modals allow-popups allow-downloads" className="h-full w-full flex-1 bg-card" />
      </div>
    </div>
  );
}
