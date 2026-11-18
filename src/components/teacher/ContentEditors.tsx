import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Pencil, Save, Trash2, UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AWARDS, DAYS, ROSTER, TEACHER_PLANNING } from "@/lib/club-data";
import { PHOTO_BUCKET, clubContentQuery, useUploadedPhotos } from "@/lib/club-content";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function useRefreshContent() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["club-content"] });
}

export function Panel({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="card-fun p-5 sm:p-7">
      <h2 className="text-2xl font-bold">{title}</h2>
      {intro && <p className="mt-1 text-muted-foreground">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ---------------- Day notes ---------------- */

export function DayNotesEditor() {
  const { data } = useSuspenseQuery(clubContentQuery);
  const { userId } = useAuth();
  const refresh = useRefreshContent();
  const [day, setDay] = useState(6);
  const saved = data.dayNotes.find((d) => d.day === day);
  const base = DAYS.find((d) => d.n === day);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(saved?.title ?? (base?.placeholder ? "" : (base?.title ?? "")));
    setNotes(saved?.notes ?? "");
  }, [day, saved?.title, saved?.notes, base?.title, base?.placeholder]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) return void toast.error("Please add a title and some notes.");
    setBusy(true);
    const { error } = await supabase
      .from("day_notes")
      .upsert({ day, title: title.trim(), notes: notes.trim(), updated_by: userId, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) return void toast.error("Could not save the notes.");
    toast.success(`Day ${day} notes saved`);
    await refresh();
  };

  const remove = async () => {
    if (!window.confirm(`Remove the notes for Day ${day}?`)) return;
    const { error } = await supabase.from("day_notes").delete().eq("day", day);
    if (error) return void toast.error("Could not remove the notes.");
    toast.success("Notes removed");
    await refresh();
  };

  return (
    <Panel title="Day notes" intro="Add what happened on a day. For Day 6 these notes replace the “coming soon” card. For other days they show as extra notes from the teacher.">
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Choose a day">
        {DAYS.map((d) => {
          const has = data.dayNotes.some((n) => n.day === d.n);
          return (
            <button
              key={d.n}
              type="button"
              aria-pressed={day === d.n}
              onClick={() => setDay(d.n)}
              className={`relative h-11 min-w-11 rounded-xl border-2 px-3 font-bold transition ${day === d.n ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
            >
              {d.n}
              {has && <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-fun-green" aria-label="has notes" />}
            </button>
          );
        })}
      </div>
      <form onSubmit={save} className="space-y-4">
        <p className="font-semibold text-muted-foreground">
          Day {day}: {base?.placeholder ? "notes not added yet" : base?.title}
        </p>
        <div className="space-y-2">
          <Label htmlFor="dn-title">Title</Label>
          <Input id="dn-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Pit-stop day" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dn-notes">What happened</Label>
          <Textarea id="dn-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={3000} rows={7} placeholder="Write one idea per line. Each line shows as its own point." />
          <p className="text-right text-xs text-muted-foreground">{notes.length} / 3000</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            <Save className="h-4 w-4" /> Save Day {day}
          </Button>
          {saved && (
            <Button type="button" variant="outline" onClick={() => void remove()}>
              <Trash2 className="h-4 w-4" /> Remove notes
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}

/* ---------------- Award winners ---------------- */

export function AwardsEditor() {
  const { data } = useSuspenseQuery(clubContentQuery);
  const names = (data.roster ?? ROSTER.map((name) => ({ id: name, name }))).map((r) => r.name);
  return (
    <Panel title="Award winners" intro="Type a winner for each Day 12 Showcase award. Leave it empty to keep “Winner to be announced”.">
      <datalist id="roster-names">
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <ul className="space-y-4">
        {AWARDS.map((a) => (
          <AwardRow key={a.title} award={a.title} emoji={a.emoji} current={data.winners.find((w) => w.award === a.title)?.winner ?? ""} />
        ))}
      </ul>
    </Panel>
  );
}

function AwardRow({ award, emoji, current }: { award: string; emoji: string; current: string }) {
  const refresh = useRefreshContent();
  const [value, setValue] = useState(current);
  useEffect(() => setValue(current), [current]);
  const id = `award-${award.replace(/\W+/g, "-")}`;

  const save = async () => {
    const winner = value.trim();
    const { error } = winner
      ? await supabase.from("award_winners").upsert({ award, winner, updated_at: new Date().toISOString() })
      : await supabase.from("award_winners").delete().eq("award", award);
    if (error) return void toast.error("Could not save the winner.");
    toast.success(winner ? `${award}: ${winner}` : `${award} cleared`);
    await refresh();
  };

  return (
    <li className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor={id}>
          <span aria-hidden="true">{emoji}</span> {award}
        </Label>
        <Input id={id} list="roster-names" value={value} onChange={(e) => setValue(e.target.value)} maxLength={120} placeholder="Winner to be announced" />
      </div>
      <Button type="button" onClick={() => void save()} disabled={value.trim() === current}>
        <Save className="h-4 w-4" /> Save
      </Button>
    </li>
  );
}

/* ---------------- Photos ---------------- */

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 1200 });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 1200, height: 1200 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PhotosEditor() {
  const { data } = useSuspenseQuery(clubContentQuery);
  const { userId } = useAuth();
  const refresh = useRefreshContent();
  const uploaded = useUploadedPhotos(data.photos);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return void toast.error("Please choose a photo.");
    if (!PHOTO_TYPES.includes(file.type)) return void toast.error("Please choose a JPG, PNG or WebP photo.");
    if (file.size > 10 * 1024 * 1024) return void toast.error("That photo is bigger than 10 MB.");
    if (!caption.trim() || !alt.trim()) return void toast.error("Please add a caption and a short description.");
    setBusy(true);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const size = await imageSize(file);
    const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      return void toast.error("Could not upload the photo.");
    }
    const { error } = await supabase.from("club_photos").insert({ path, caption: caption.trim(), alt: alt.trim(), ...size, uploaded_by: userId });
    setBusy(false);
    if (error) {
      await supabase.storage.from(PHOTO_BUCKET).remove([path]);
      return void toast.error("Could not save the photo.");
    }
    toast.success("Photo added to the Photos page");
    setFile(null);
    setCaption("");
    setAlt("");
    if (fileRef.current) fileRef.current.value = "";
    await refresh();
  };

  const remove = async (id: string, path: string) => {
    if (!window.confirm("Remove this photo from the site?")) return;
    const { error } = await supabase.from("club_photos").delete().eq("id", id);
    if (error) return void toast.error("Could not remove the photo.");
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
    toast.success("Photo removed");
    await refresh();
  };

  return (
    <Panel title="Photos" intro="New photos appear on the Photos page after the club's own four photos. Only share photos the school allows.">
      <form onSubmit={upload} className="grid gap-4 rounded-2xl bg-muted/50 p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="ph-file">Photo (JPG, PNG or WebP, up to 10 MB)</Label>
          <Input id="ph-file" ref={fileRef} type="file" accept={PHOTO_TYPES.join(",")} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ph-cap">Caption</Label>
          <Input id="ph-cap" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={80} placeholder="e.g. Prize day" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ph-alt">Describe the photo (for screen readers)</Label>
          <Input id="ph-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} placeholder="e.g. Students holding their certificates" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            <ImagePlus className="h-4 w-4" /> {busy ? "Uploading…" : "Upload photo"}
          </Button>
        </div>
      </form>

      {data.photos.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No extra photos yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(uploaded.data ?? data.photos.map((p) => ({ ...p, src: "" }))).map((p) => (
            <li key={p.id} className="overflow-hidden rounded-2xl border bg-card">
              {p.src ? <img src={p.src} alt={p.alt} className="aspect-video w-full object-cover" /> : <div className="aspect-video bg-muted" />}
              <div className="flex items-center gap-2 p-3">
                <p className="flex-1 truncate font-semibold">{p.caption}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => void remove(p.id, p.path)} aria-label={`Remove photo ${p.caption}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ---------------- Roster ---------------- */

export function RosterEditor() {
  const { data } = useSuspenseQuery(clubContentQuery);
  const refresh = useRefreshContent();
  const list = data.roster ?? [];
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const nextOrder = useMemo(() => list.length + 1, [list.length]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const { error } = await supabase.from("roster_members").insert({ name: n, sort_order: nextOrder });
    if (error) return void toast.error("Could not add the name.");
    setName("");
    toast.success(`${n} added to the roster`);
    await refresh();
  };

  const rename = async (id: string) => {
    const n = draft.trim();
    if (!n) return;
    const { error } = await supabase.from("roster_members").update({ name: n }).eq("id", id);
    if (error) return void toast.error("Could not change the name.");
    setEditing(null);
    await refresh();
  };

  const remove = async (id: string, n: string) => {
    if (!window.confirm(`Remove ${n} from the roster?`)) return;
    const { error } = await supabase.from("roster_members").delete().eq("id", id);
    if (error) return void toast.error("Could not remove the name.");
    toast.success(`${n} removed`);
    await refresh();
  };

  return (
    <Panel title={`Roster (${list.length})`} intro="Names only. Never add student ID numbers.">
      <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
        <Label htmlFor="ro-new" className="sr-only">New explorer's full name</Label>
        <Input id="ro-new" value={name} onChange={(e) => setName(e.target.value.replace(/\d/g, ""))} maxLength={80} placeholder="New explorer's full name" />
        <Button type="submit">
          <UserPlus className="h-4 w-4" /> Add
        </Button>
      </form>
      <ol className="mt-6 divide-y rounded-2xl border">
        {list.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2">
            <span className="w-6 text-right text-sm font-bold text-muted-foreground">{i + 1}</span>
            {editing === r.id ? (
              <>
                <Input value={draft} onChange={(e) => setDraft(e.target.value.replace(/\d/g, ""))} maxLength={80} aria-label={`New name for ${r.name}`} className="h-9" />
                <Button type="button" size="sm" onClick={() => void rename(r.id)} aria-label="Save name">
                  <Save className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)} aria-label="Cancel">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 font-semibold">{r.name}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(r.id);
                    setDraft(r.name);
                  }}
                  aria-label={`Edit ${r.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => void remove(r.id, r.name)} aria-label={`Remove ${r.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ---------------- Planning notes from the club PDF ---------------- */

export function PlanningNotes() {
  return (
    <Panel title="Planning notes" intro="From the club's planning PDF. Only staff can see this.">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold">What to prepare for each day</h3>
          <ul className="mt-2 space-y-2">
            {TEACHER_PLANNING.perDay.map((d) => (
              <li key={d.day} className="rounded-xl bg-muted/50 px-4 py-2">
                <strong>Day {d.day}:</strong> {d.note}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Things required</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {TEACHER_PLANNING.thingsRequired.map((t) => (
              <li key={t} className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
