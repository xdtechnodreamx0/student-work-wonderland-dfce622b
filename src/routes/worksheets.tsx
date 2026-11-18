import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ZoomIn, Upload, Trash2, ArrowUp, ArrowDown, Plus, Sparkles } from "lucide-react";
import { WORKSHEETS as STATIC_WORKSHEETS, PROMPT_TIPS } from "@/lib/club-data";
import { pageMeta } from "@/lib/seo";
import { PageHeader, Reveal, Section } from "@/components/club/Bits";
import { Lightbox } from "@/components/club/Lightbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { canEditContent } from "@/lib/accounts";
import { toast } from "sonner";

export const Route = createFileRoute("/worksheets")({
  head: () => pageMeta("Worksheets", "The “Good Prompt, Great Result!” and “AI Prompt Builder” worksheets we used to learn prompt writing."),
  component: Worksheets,
});

export type CustomWorksheet = {
  id: string;
  src: string;
  title: string;
  emoji: string;
  gradeLevel: string;
  topic: string;
  description: string;
  used: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

const STORAGE_KEY = "mbc_custom_worksheets_v1";

function Worksheets() {
  const auth = useAuth();
  const isStaff = canEditContent(auth.roles);

  const [open, setOpen] = useState<number | null>(null);
  const [worksheets, setWorksheets] = useState<CustomWorksheet[]>(() => {
    return STATIC_WORKSHEETS.map((w, idx) => ({
      id: `static-${idx}`,
      src: w.src,
      title: w.title,
      emoji: w.emoji,
      gradeLevel: "Class 4C",
      topic: idx === 0 ? "Prompting" : "Prompt Engineering",
      description: w.description,
      used: w.used,
      alt: w.alt,
      width: w.width,
      height: w.height,
      caption: w.caption,
    }));
  });

  const [filterTopic, setFilterTopic] = useState<string>("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorksheets(parsed);
        }
      }
    } catch {
      // fallback to initial state
    }
  }, []);

  const saveWorksheets = (updated: CustomWorksheet[]) => {
    setWorksheets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage limit or private mode
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload an image or PDF worksheet.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newSheet: CustomWorksheet = {
        id: `custom-${Date.now()}`,
        src,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        emoji: "📄",
        gradeLevel: "Class 4C",
        topic: "General Math",
        description: "New worksheet uploaded by staff.",
        used: "Class practice and homework review.",
        alt: file.name,
        width: 1024,
        height: 1400,
        caption: file.name,
      };
      const updated = [newSheet, ...worksheets];
      saveWorksheets(updated);
      toast.success("Worksheet added! You can now edit its details or sort it.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= worksheets.length) return;
    const copy = [...worksheets];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    saveWorksheets(copy);
    toast.success("Reordered worksheet");
  };

  const remove = (id: string) => {
    if (!confirm("Are you sure you want to remove this worksheet?")) return;
    const updated = worksheets.filter((w) => w.id !== id);
    saveWorksheets(updated);
    toast.success("Worksheet removed");
  };

  const topics = ["all", ...Array.from(new Set(worksheets.map((w) => w.topic)))];
  const filtered = filterTopic === "all" ? worksheets : worksheets.filter((w) => w.topic === filterTopic);

  return (
    <>
      <PageHeader eyebrow="📝 Worksheets" emoji="✏️" title="Our prompt & math worksheets" intro="Tap a worksheet to zoom in and read every detail." />

      {isStaff && (
        <Section className="pb-0">
          <div className="mx-auto max-w-5xl rounded-3xl border-2 border-primary/20 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 font-display text-lg font-bold">
                  <Sparkles className="h-5 w-5 text-primary" /> Staff Worksheet Manager
                </p>
                <p className="text-sm text-muted-foreground">Upload new worksheets, organize topics, and sort display order.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground shadow transition hover:bg-primary/90">
                <Upload className="h-4 w-4" /> Upload Worksheet
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </Section>
      )}

      <Section>
        {topics.length > 2 && (
          <div className="mx-auto mb-8 flex max-w-5xl flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Topic Filter:</span>
            {topics.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filterTopic === t ? "default" : "outline"}
                onClick={() => setFilterTopic(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {filtered.map((w, i) => (
            <Reveal key={w.id} delay={i * 80}>
              <article className="card-fun lift flex h-full flex-col overflow-hidden">
                <button type="button" onClick={() => setOpen(i)} className="group relative block overflow-hidden bg-muted" aria-label={`Zoom worksheet: ${w.title}`}>
                  <img src={w.src} alt={w.alt} width={w.width} height={w.height} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm font-bold shadow">
                    <ZoomIn className="h-4 w-4" /> Zoom
                  </span>
                  <span className="absolute top-3 left-3 rounded-lg bg-card/90 px-2.5 py-1 text-xs font-bold backdrop-blur">
                    {w.gradeLevel} · {w.topic}
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-2xl font-bold">
                    {w.emoji} {w.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground">{w.description}</p>
                  <p className="mt-3 rounded-xl bg-secondary px-4 py-2 font-semibold text-secondary-foreground">
                    <strong>How we used it:</strong> {w.used}
                  </p>

                  {isStaff && (
                    <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs font-bold">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === filtered.length - 1}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => remove(w.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 max-w-5xl rounded-3xl bg-fun-amber-soft p-7">
          <h2 className="text-2xl font-bold text-fun-amber-ink">⭐ Tips to write a good prompt</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {PROMPT_TIPS.map((t) => (
              <li key={t} className="rounded-xl bg-card px-4 py-2 font-semibold">
                ⭐ {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-display text-xl font-semibold">Remember: the better your prompt, the better the result! 💖</p>
          <Button asChild variant="hero" className="mt-5">
            <Link to="/games">Try the games & challenges →</Link>
          </Button>
        </Reveal>
      </Section>
      <Lightbox items={filtered} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </>
  );
}
