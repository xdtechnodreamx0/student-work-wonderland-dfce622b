import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { can } from "@/lib/accounts";
import { clubContentQuery } from "@/lib/club-content";
import { ROSTER } from "@/lib/club-data";
import { SECTIONS, type ClubProject, type ProjectSection } from "@/lib/projects";
import { addProject, deleteProject, refreshProjectAI, updateProject } from "@/lib/projects.functions";

function errText(e: unknown) {
  return e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.";
}

/* ---------------- Add a project (anyone signed in) ---------------- */

export function AddProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const auth = useAuth();
  const qc = useQueryClient();
  const add = useServerFn(addProject);
  const staff = can(auth.roles, "editProjects");
  const content = useQuery({ ...clubContentQuery, enabled: open && staff });
  const roster = content.data?.roster?.map((r) => r.name) ?? ROSTER;
  const [busy, setBusy] = useState(false);
  const [href, setHref] = useState("");
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [details, setDetails] = useState("");
  const [section, setSection] = useState<ProjectSection>("student");
  const [maker, setMaker] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await add({ data: { href, title, blurb, details, section: staff ? section : "student", makerName: staff && section === "student" ? maker : "" } });
      await qc.invalidateQueries({ queryKey: ["club-projects"] });
      toast.success("Project added! Pixel wrote about it and started its preview video 🎬");
      setHref(""); setTitle(""); setBlurb(""); setDetails(""); setMaker("");
      onOpenChange(false);
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">🚀 Add a project</DialogTitle>
          <DialogDescription>
            Only the link is needed. Pixel will look at your website, write the description, give it an emoji and make a moving preview.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-href">Website link *</Label>
            <Input id="p-href" required value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://my-maths-site.lovable.app" inputMode="url" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-title">Project name (optional)</Label>
            <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Pixel can name it for you" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-blurb">Short description (optional)</Label>
            <Textarea id="p-blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} maxLength={600} rows={2} placeholder="Leave empty and Pixel will write it" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-details">More details (optional)</Label>
            <Textarea id="p-details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={3000} rows={3} placeholder="What can people do on it? Who is it for?" />
          </div>
          {staff && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={section} onValueChange={(v) => setSection(v as ProjectSection)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {section === "student" && (
                <div className="space-y-1.5">
                  <Label>Made by</Label>
                  <Select value={maker || "me"} onValueChange={(v) => setMaker(v === "me" ? "" : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                      {roster.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          {!staff && <p className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">Your project goes in <strong>Student Projects</strong> with your name on it. Your teacher or mentors can move it later.</p>}
          <DialogFooter>
            <Button type="submit" variant="hero" disabled={busy || !href.trim()}>
              {busy ? <><Loader2 className="animate-spin" /> Pixel is looking at it…</> : <><Sparkles /> Add project</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Edit a project (mentors, teacher, admin) ---------------- */

export function EditProjectDialog({ project, onClose }: { project: ClubProject; onClose: () => void }) {
  const auth = useAuth();
  const qc = useQueryClient();
  const save = useServerFn(updateProject);
  const remove = useServerFn(deleteProject);
  const refresh = useServerFn(refreshProjectAI);
  const isAdmin = can(auth.roles, "deleteProjects");
  const [busy, setBusy] = useState<null | "save" | "ai" | "video" | "delete">(null);
  const [f, setF] = useState({
    title: project.title,
    emoji: project.emoji,
    blurb: project.blurb,
    details: project.details,
    href: project.href,
    section: project.section,
    group_name: project.group_name,
    members: project.members,
    credit: project.credit,
    tags: project.tags.join(", "),
    featured: project.featured,
    sort_order: project.sort_order,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const refreshList = () => qc.invalidateQueries({ queryKey: ["club-projects"] });

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy("save");
    try {
      const tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6);
      await save({ data: { id: project.id, ...f, tags, sort_order: Number(f.sort_order) || 0 } });
      await refreshList();
      toast.success("Saved!");
      onClose();
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(null);
    }
  }

  async function onAI(kind: "ai" | "video") {
    setBusy(kind);
    try {
      await refresh({ data: { id: project.id, rewrite: kind === "ai", video: kind === "video" } });
      await refreshList();
      toast.success(kind === "ai" ? "Pixel rewrote the description and picked a new emoji ✨" : "Pixel started a new preview video 🎬 It takes about a minute.");
      onClose();
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    setBusy("delete");
    try {
      await remove({ data: { id: project.id } });
      await refreshList();
      toast.success("Project deleted.");
      onClose();
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">✏️ Edit project</DialogTitle>
          <DialogDescription>Change the words, move it to another section or add more details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[5rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="e-emoji">Emoji</Label>
              <Input id="e-emoji" value={f.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={8} className="text-center text-2xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-title">Name</Label>
              <Input id="e-title" required value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-blurb">Short description</Label>
            <Textarea id="e-blurb" value={f.blurb} onChange={(e) => set("blurb", e.target.value)} maxLength={600} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-details">More details</Label>
            <Textarea id="e-details" value={f.details} onChange={(e) => set("details", e.target.value)} maxLength={3000} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-href">Link</Label>
            <Input id="e-href" required value={f.href} onChange={(e) => set("href", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={f.section} onValueChange={(v) => set("section", v as ProjectSection)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-group">Group</Label>
              <Input id="e-group" value={f.group_name} onChange={(e) => set("group_name", e.target.value)} maxLength={80} placeholder="e.g. Group Sunflower" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-order">Order</Label>
              <Input id="e-order" type="number" min={0} max={1000} value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-members">Team members</Label>
              <Input id="e-members" value={f.members} onChange={(e) => set("members", e.target.value)} maxLength={300} placeholder="Names, separated by commas" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-credit">Credit line</Label>
              <Input id="e-credit" value={f.credit} onChange={(e) => set("credit", e.target.value)} maxLength={160} placeholder="e.g. Guided by mentor Ekta" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-tags">Labels</Label>
            <Input id="e-tags" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Quizzes, Grades 1–3, Games" />
          </div>
          <label className="flex items-center gap-3 font-semibold">
            <Switch checked={f.featured} onCheckedChange={(v) => set("featured", v)} /> ⭐ Feature this project at the top
          </label>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-muted p-3">
            <Button type="button" variant="soft" size="sm" disabled={!!busy} onClick={() => void onAI("ai")}>
              {busy === "ai" ? <Loader2 className="animate-spin" /> : <Sparkles />} Rewrite with Pixel
            </Button>
            {project.href.startsWith("https://") && (
              <Button type="button" variant="soft" size="sm" disabled={!!busy} onClick={() => void onAI("video")}>
                {busy === "video" ? <Loader2 className="animate-spin" /> : <Clapperboard />} Make a new video
              </Button>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {isAdmin ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={!!busy}><Trash2 /> Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete “{project.title}”?</AlertDialogTitle>
                    <AlertDialogDescription>This removes the project from the site for everyone. It can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void onDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <p className="self-center text-sm text-muted-foreground">Only the admin can delete projects.</p>
            )}
            <Button type="submit" disabled={!!busy}>{busy === "save" ? <Loader2 className="animate-spin" /> : null} Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
