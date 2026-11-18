import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { MODE_KEY, isMode, type Mode } from "@/lib/modes";

type ModeState = { mode: Mode; setMode: (m: Mode) => void };
const ModeContext = createContext<ModeState | null>(null);

async function partyBurst() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.3 } });
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("day");

  useEffect(() => {
    const m = document.documentElement.dataset["mode"];
    if (isMode(m)) setModeState(m);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    document.documentElement.dataset["mode"] = m;
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      // Storage may be blocked; the look still changes for this visit.
    }
    if (m === "party") void partyBurst();
  }, []);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside ModeProvider");
  return ctx;
}
