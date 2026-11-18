import { Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMode } from "@/hooks/use-mode";
import { MODES } from "@/lib/modes";
import { cn } from "@/lib/utils";

/** Top-bar button to pick Day, Night, Party or Study mode. */
export function ModeSwitcher() {
  const { mode, setMode } = useMode();
  const current = MODES.find((m) => m.id === mode)!;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Change look. Now: ${current.label} mode`}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-2 bg-card px-2.5 text-sm font-bold text-foreground transition hover:border-primary sm:px-3"
      >
        <span className="text-lg" aria-hidden="true">
          {current.emoji}
        </span>
        <span className="hidden md:inline">{current.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Pick a look</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MODES.map((m) => (
          <DropdownMenuItem key={m.id} onSelect={() => setMode(m.id)} className="gap-3 py-2">
            <span className="text-xl" aria-hidden="true">
              {m.emoji}
            </span>
            <span className="flex-1">
              <span className="block font-bold">{m.label} mode</span>
              <span className="block text-xs text-muted-foreground">{m.text}</span>
            </span>
            {m.id === mode && <Check className="h-4 w-4" aria-label="Selected" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A row of four buttons for the sidebar. */
export function ModeButtons() {
  const { mode, setMode } = useMode();
  return (
    <div role="group" aria-label="Site look" className="grid grid-cols-4 gap-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          title={`${m.label} mode: ${m.text}`}
          onClick={() => setMode(m.id)}
          className={cn(
            "flex min-h-11 flex-col items-center justify-center rounded-xl text-[11px] font-bold transition",
            mode === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary",
          )}
        >
          <span className="text-base" aria-hidden="true">
            {m.emoji}
          </span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

const PARTY = [
  { e: "🎈", c: "left-[2%] top-[30%]", d: "0s" },
  { e: "🎉", c: "right-[3%] top-[22%]", d: "1s" },
  { e: "🥳", c: "right-[2%] bottom-[30%]", d: "2s" },
  { e: "🎊", c: "left-[3%] bottom-[14%]", d: "1.5s" },
  { e: "✨", c: "left-[48%] bottom-[4%]", d: "0.5s" },
];

/** Floating party decorations, only in Party mode. */
export function PartyLayer() {
  const { mode } = useMode();
  if (mode !== "party") return null;
  return (
    <div aria-hidden="true" className="decor pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {PARTY.map((p) => (
        <span key={p.e} className={`animate-float absolute text-3xl opacity-80 sm:text-4xl ${p.c}`} style={{ animationDelay: p.d }}>
          {p.e}
        </span>
      ))}
    </div>
  );
}
