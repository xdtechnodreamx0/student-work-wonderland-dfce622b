import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/lib/club-data";
import { FounderEmblem } from "./Art";

/** Fades + rises children into view once. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={cn("reveal", shown && "is-visible", className)}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** Counts up to a number once visible. */
export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(to);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  emoji,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  emoji?: string;
}) {
  return (
    <header className="relative overflow-hidden bg-hero px-5 pb-14 pt-12 sm:px-10">
      {emoji && (
        <span aria-hidden="true" className="decor animate-float absolute right-6 top-6 text-6xl opacity-80 sm:right-16 sm:text-7xl">
          {emoji}
        </span>
      )}
      <Reveal className="relative max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-sm font-bold text-primary shadow-sm">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </Reveal>
    </header>
  );
}

export function FounderBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="founder-ring inline-flex shrink-0 items-center whitespace-nowrap gap-2 rounded-full px-2.5 py-1 text-sm font-bold text-foreground">
      <FounderEmblem className="h-6 w-6 shrink-0" />
      <span className={cn(compact ? "hidden sm:inline" : "inline")}>🚀 {CONFIG.founderBadge}</span>
      <span className={cn(compact ? "sm:hidden" : "hidden")}>Salman</span>
      <span className="animate-online h-2.5 w-2.5 rounded-full bg-online" aria-hidden="true" />
      <span className="sr-only">(founder, online)</span>
    </span>
  );
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("px-5 py-12 sm:px-10", className)}>{children}</section>;
}
