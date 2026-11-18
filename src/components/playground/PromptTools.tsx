import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PUZZLE_CARDS, PROMPT_PAIRS } from "@/lib/club-data";
import { FORMULA, scorePrompt } from "@/lib/prompt-doctor";
import { FUN } from "@/components/club/Art";
import { cn } from "@/lib/utils";

const field = "min-h-11 w-full rounded-xl border-2 bg-background px-3 font-semibold outline-none focus:border-primary";

/* ---------------- Tool 1: Prompt Builder ---------------- */
const TOPICS = ["Math Club", "Zoo", "Book Review", "My Hobby"];
const AUDIENCES = ["Students", "Parents", "Teachers"];
const COLOURS = ["Blue/White", "Green/Yellow", "Red/Orange"];
const PAGES = ["Home", "About", "Gallery", "Contact"];
const STYLES = ["Modern", "Playful", "Minimal"];
const FEATURES = ["Buttons", "Image slider", "Contact form", "Mobile friendly"];

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function buildPrompt(o: { topic: string; audience: string; colours: string; pages: string[]; style: string; features: string[] }) {
  const [c1 = "blue", c2 = "white"] = o.colours.split("/").map((c) => c.toLowerCase());
  // Follows the Prompt Formula order: Topic + Audience + Colours + Pages + Style + Features.
  let s = `Create a website about ${o.topic === "My Hobby" ? "my hobby" : `a ${o.topic.toLowerCase()}`} for ${o.audience.toLowerCase()}. `;
  s += `Use ${c1} and ${c2} colours. It should have ${listJoin(o.pages)} pages. Make it look ${o.style.toLowerCase()}.`;
  if (o.features.length) s += ` Add ${listJoin(o.features.map((f) => f.toLowerCase()))}.`;
  return s;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function PromptBuilder() {
  const [topic, setTopic] = useState("Math Club");
  const [audience, setAudience] = useState("Students");
  const [colours, setColours] = useState("Blue/White");
  const [pages, setPages] = useState<string[]>(["Home", "About"]);
  const [style, setStyle] = useState("Modern");
  const [features, setFeatures] = useState<string[]>(["Buttons"]);
  const [out, setOut] = useState("");
  const [msg, setMsg] = useState("");

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!pages.length) {
            setOut("");
            setMsg("Pick at least one page so your website has somewhere to go! 📄");
            return;
          }
          setMsg("");
          setOut(buildPrompt({ topic, audience, colours, pages, style, features }));
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="🎯 Topic" value={topic} onChange={setTopic} options={TOPICS} />
          <Select label="👥 Audience" value={audience} onChange={setAudience} options={AUDIENCES} />
          <Select label="🎨 Colours" value={colours} onChange={setColours} options={COLOURS} />
          <Select label="✨ Style" value={style} onChange={setStyle} options={STYLES} />
        </div>
        <Checks legend="📄 Pages" options={PAGES} value={pages} onToggle={(v) => toggle(pages, setPages, v)} />
        <Checks legend="🧰 Features" options={FEATURES} value={features} onToggle={(v) => toggle(features, setFeatures, v)} />
        <Button type="submit" variant="hero" size="lg">
          Build my prompt ⚡
        </Button>
        <p aria-live="polite" className="font-bold text-fun-pink-ink">
          {msg}
        </p>
      </form>
      <div className="rounded-3xl bg-brand p-1">
        <div className="flex h-full flex-col rounded-[1.35rem] bg-card p-6">
          <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Your prompt</p>
          <p className="mt-3 flex-1 font-display text-xl leading-relaxed">
            {out || <span className="text-muted-foreground">Choose your options and press “Build my prompt”. Your prompt appears here!</span>}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Formula: Topic + Audience + Colours + Pages + Style + Features</p>
          {out && (
            <Button
              variant="mint"
              className="mt-4 self-start"
              onClick={async () => setMsg((await copyText(out)) ? "Copied! ✅" : "Couldn't copy — try selecting the text.")}
            >
              <Copy /> Copy to clipboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block font-bold">
      {label}
      <select className={cn(field, "mt-1")} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Checks({ legend, options, value, onToggle }: { legend: string; options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="font-bold">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 px-4 font-semibold transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring",
              value.includes(o) ? "border-primary bg-secondary text-secondary-foreground" : "hover:border-primary",
            )}
          >
            <input type="checkbox" className="sr-only" checked={value.includes(o)} onChange={() => onToggle(o)} />
            {value.includes(o) ? "✅" : "⬜"} {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------------- Tool 2: Prompt Card Puzzle ---------------- */
export function CardPuzzle() {
  const [slots, setSlots] = useState<(string | null)[]>(Array(12).fill(null));
  const [picked, setPicked] = useState<string | null>(null);
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState("");
  const placed = new Set(slots.filter(Boolean) as string[]);
  const pool = PUZZLE_CARDS.filter((c) => !placed.has(c.id));
  const card = (id: string) => PUZZLE_CARDS.find((c) => c.id === id)!;

  const put = (slot: number, id: string) => {
    setSlots((s) => {
      const next = s.map((x) => (x === id ? null : x));
      next[slot] = id;
      return next;
    });
    setPicked(null);
  };
  const move = (i: number, d: number) =>
    setSlots((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const n = [...s];
      const a = n[i] ?? null;
      n[i] = n[j] ?? null;
      n[j] = a;
      return n;
    });
  const filled = slots.filter(Boolean).length;

  return (
    <div className="space-y-6">
      <p className="rounded-xl bg-fun-amber-soft px-4 py-2 font-semibold text-fun-amber-ink">
        💡 Hint: a good order often starts with <strong>Website Type → Purpose → Audience → Pages…</strong> There's no single right answer — use all 12 cards!
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-bold">Cards ({pool.length} left) — tap a card, then tap a slot, or drag it</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {pool.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                  onClick={() => setPicked(picked === c.id ? null : c.id)}
                  aria-pressed={picked === c.id}
                  className={cn(
                    "w-full cursor-grab rounded-xl border-2 p-3 text-left transition hover:-translate-y-0.5",
                    FUN[c.color].soft,
                    picked === c.id ? "border-primary shadow-glow" : "border-transparent",
                  )}
                >
                  <span className={cn("block text-xs font-extrabold uppercase", FUN[c.color].ink)}>{c.label}</span>
                  <span className="text-sm font-semibold">{c.text}</span>
                </button>
              </li>
            ))}
            {pool.length === 0 && <li className="font-bold text-fun-green-ink">All cards placed! 🎉</li>}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-bold">Your prompt slots ({filled} / 12)</h3>
          <ol className="space-y-2">
            {slots.map((id, i) => (
              <li
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.getData("text/plain");
                  if (dropped) put(i, dropped);
                }}
                className={cn("flex min-h-12 items-center gap-2 rounded-xl border-2 border-dashed p-2", id ? "border-solid bg-card" : "bg-muted")}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                {id ? (
                  <>
                    <span className="flex-1 text-sm">
                      <strong className={FUN[card(id).color].ink}>{card(id).label}:</strong> {card(id).text}
                    </span>
                    <button type="button" aria-label={`Move slot ${i + 1} up`} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Move slot ${i + 1} down`} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Remove card from slot ${i + 1}`} onClick={() => setSlots((s) => s.map((x, k) => (k === i ? null : x)))} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={!picked}
                    onClick={() => picked && put(i, picked)}
                    className="flex-1 rounded-lg px-2 py-1 text-left text-sm font-semibold text-muted-foreground enabled:hover:bg-secondary enabled:hover:text-secondary-foreground"
                  >
                    {picked ? "Tap to place the card here" : "Empty slot"}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-fun-purple bg-fun-purple-soft p-4">
        <label htmlFor="challenge" className="font-bold text-fun-purple-ink">
          🏅 Challenge card: add one more idea of your own
        </label>
        <input
          id="challenge"
          maxLength={120}
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="e.g. Add a fun quiz page."
          className={cn(field, "mt-2")}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{extra.length}/120</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="hero"
          onClick={() => {
            const parts = slots.filter(Boolean).map((id) => card(id!).text);
            if (extra.trim()) parts.push(extra.trim());
            setResult(parts.length ? parts.join(" ") : "Place some cards first! 🧩");
          }}
        >
          Read my prompt 📣
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setSlots(Array(12).fill(null));
            setResult("");
            setExtra("");
          }}
        >
          <RotateCcw /> Start over
        </Button>
      </div>
      {result && (
        <div className="animate-pop rounded-2xl bg-card p-5 shadow-lift" aria-live="polite">
          <p className="text-lg">{result}</p>
          {filled === 12 && <p className="mt-2 font-bold text-fun-green-ink">🌟 All 12 cards used — that's a super complete prompt!</p>}
        </div>
      )}
    </div>
  );
}

/* ---------------- Tool 3: Weak vs Strong ---------------- */
const WEAK = "Make a website.";
const STRONG = "Create a modern website for a 4th-grade math club with Home, About, and Gallery pages in blue and white colors.";

export function WeakStrong() {
  const [strong, setStrong] = useState(false);
  const [pair, setPair] = useState(0);
  const text = strong ? STRONG : WEAK;
  const { found } = scorePrompt(text);
  const p = PROMPT_PAIRS[pair] ?? PROMPT_PAIRS[0]!;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4 font-display text-xl font-semibold">
        <span className={cn(!strong ? "text-fun-pink-ink" : "text-muted-foreground")}>😕 Weak</span>
        <Switch checked={strong} onCheckedChange={setStrong} aria-label="Show the strong prompt" className="scale-150" />
        <span className={cn(strong ? "text-fun-green-ink" : "text-muted-foreground")}>💪 Strong</span>
      </div>
      <div className={cn("rounded-3xl p-8 text-center transition-colors", strong ? "bg-fun-green-soft" : "bg-fun-pink-soft")} aria-live="polite">
        <p className="font-display text-2xl font-semibold sm:text-3xl" key={text}>
          “{text}”
        </p>
      </div>
      <div>
        <p className="mb-3 text-center font-bold">Which parts of the Prompt Formula are inside?</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {FORMULA.map((f) => {
            const has = found.includes(f.id);
            return (
              <li key={f.id} className={cn("rounded-full px-4 py-2 font-bold", has ? "bg-fun-green text-foreground" : "bg-muted text-muted-foreground line-through")}>
                {has ? "✅" : "❌"} {f.label}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-center text-muted-foreground">
          {strong
            ? "A strong prompt has clear instructions, specific details and proper context — easy for AI to understand, so we get an accurate and useful result!"
            : "A weak prompt has unclear instructions, few details and no context. It may confuse AI and gives only a general result."}
        </p>
      </div>

      <div className="rounded-3xl border bg-card p-6">
        <h3 className="text-xl font-semibold">From our worksheet: good vs bad</h3>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a prompt example">
          {PROMPT_PAIRS.map((x, i) => (
            <button
              key={x.task}
              type="button"
              aria-pressed={pair === i}
              aria-label={`Example ${i + 1}: ${x.task}`}
              onClick={() => setPair(i)}
              className={cn("min-h-11 min-w-11 rounded-full border px-3 text-sm font-bold", pair === i ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
            >
              {x.emoji} {i + 1}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3" key={pair}>
          <div className="animate-pop rounded-2xl bg-fun-pink-soft p-4">
            <p className="text-sm font-extrabold text-fun-pink-ink">❌ BAD PROMPT</p>
            <p className="mt-1 font-semibold">{p.bad}</p>
          </div>
          <div className="animate-pop rounded-2xl bg-fun-green-soft p-4 md:col-span-2">
            <p className="text-sm font-extrabold text-fun-green-ink">✅ GOOD PROMPT · {p.task}</p>
            <p className="mt-1 font-semibold">{p.good}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <strong>Why is it better?</strong> {p.why}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
