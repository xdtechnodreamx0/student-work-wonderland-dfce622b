import { cn } from "@/lib/utils";
import type { FunColor } from "@/lib/club-data";

/** Pixel — the club's friendly robot mascot. */
export function PixelRobot({ className, waving = false }: { className?: string; waving?: boolean }) {
  return (
    <svg viewBox="0 0 200 220" className={className} role="img" aria-label="Pixel the friendly robot">
      <defs>
        <linearGradient id="pixel-body" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--fun-blue)" />
          <stop offset="1" stopColor="var(--fun-purple)" />
        </linearGradient>
      </defs>
      <line x1="100" y1="18" x2="100" y2="42" stroke="var(--fun-purple)" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="14" r="10" fill="var(--fun-amber)" className="animate-pulse" />
      <rect x="38" y="40" width="124" height="96" rx="32" fill="url(#pixel-body)" />
      <rect x="54" y="58" width="92" height="58" rx="22" fill="var(--foreground)" />
      <circle cx="80" cy="86" r="11" fill="var(--fun-teal)" />
      <circle cx="120" cy="86" r="11" fill="var(--fun-teal)" />
      <circle cx="84" cy="82" r="4" fill="var(--background)" />
      <circle cx="124" cy="82" r="4" fill="var(--background)" />
      <path d="M86 104 Q100 114 114 104" stroke="var(--fun-teal)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="88" r="10" fill="var(--fun-pink)" />
      <circle cx="170" cy="88" r="10" fill="var(--fun-pink)" />
      <rect x="62" y="142" width="76" height="56" rx="20" fill="url(#pixel-body)" />
      <rect x="84" y="156" width="32" height="20" rx="6" fill="var(--background)" />
      <text x="100" y="171" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--fun-blue)" fontFamily="var(--font-display)">
        AI
      </text>
      <g className={cn(waving && "origin-[150px_150px] animate-wiggle")}>
        <path d="M138 156 Q162 146 172 124" stroke="var(--fun-purple)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="174" cy="118" r="9" fill="var(--fun-amber)" />
      </g>
      <path d="M62 160 Q40 170 36 190" stroke="var(--fun-blue)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M150 30 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4z" fill="var(--fun-amber)" />
      <path d="M36 30 l3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3z" fill="var(--fun-pink)" />
    </svg>
  );
}

/** Founder emblem: a rocket with a star. */
export function FounderEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="emblem-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--fun-blue)" />
          <stop offset="0.6" stopColor="var(--fun-purple)" />
          <stop offset="1" stopColor="var(--fun-pink)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#emblem-g)" />
      <path d="M24 9c5 4 7 10 6 17l-6 6-6-6c-1-7 1-13 6-17z" fill="var(--background)" />
      <circle cx="24" cy="20" r="3" fill="var(--fun-blue)" />
      <path d="M18 26l-4 5 5 1zM30 26l4 5-5 1z" fill="var(--fun-amber)" />
      <path d="M21 33q3 6 3 6t3-6z" fill="var(--fun-amber)" />
      <path d="M37 9l1.4 3 3 1.4-3 1.4L37 18l-1.4-3-3-1.4 3-1.4z" fill="var(--fun-amber)" />
    </svg>
  );
}

export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={cn("block h-12 w-full", className)} aria-hidden="true">
      <path d="M0 40 C240 90 480 0 720 36 C960 72 1200 10 1440 44 L1440 80 L0 80 Z" fill="var(--background)" />
    </svg>
  );
}

/** Tailwind classes per club colour (literal strings so Tailwind can see them). */
export const FUN: Record<FunColor, { soft: string; ink: string; solid: string; border: string; ring: string }> = {
  blue: { soft: "bg-fun-blue-soft", ink: "text-fun-blue-ink", solid: "bg-fun-blue", border: "border-fun-blue", ring: "ring-fun-blue" },
  amber: { soft: "bg-fun-amber-soft", ink: "text-fun-amber-ink", solid: "bg-fun-amber", border: "border-fun-amber", ring: "ring-fun-amber" },
  purple: { soft: "bg-fun-purple-soft", ink: "text-fun-purple-ink", solid: "bg-fun-purple", border: "border-fun-purple", ring: "ring-fun-purple" },
  green: { soft: "bg-fun-green-soft", ink: "text-fun-green-ink", solid: "bg-fun-green", border: "border-fun-green", ring: "ring-fun-green" },
  pink: { soft: "bg-fun-pink-soft", ink: "text-fun-pink-ink", solid: "bg-fun-pink", border: "border-fun-pink", ring: "ring-fun-pink" },
  teal: { soft: "bg-fun-teal-soft", ink: "text-fun-teal-ink", solid: "bg-fun-teal", border: "border-fun-teal", ring: "ring-fun-teal" },
};

export const FUN_ORDER: FunColor[] = ["blue", "pink", "teal", "amber", "purple", "green"];
