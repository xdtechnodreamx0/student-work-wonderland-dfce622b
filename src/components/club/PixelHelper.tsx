import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Send, X } from "lucide-react";
import { answerQuestion, QUICK_CHIPS } from "@/lib/helper";
import { useServerFn } from "@tanstack/react-start";
import { askPixel } from "@/lib/pixel.functions";
import { askPixelMember } from "@/lib/staff-ai.functions";
import { useAuth } from "@/hooks/use-auth";
import { PixelRobot } from "./Art";
import { cn } from "@/lib/utils";

type Ctx = { open: boolean; setOpen: (o: boolean) => void; ask: (q: string) => void };
const HelperCtx = createContext<Ctx | null>(null);

export function useHelper() {
  const c = useContext(HelperCtx);
  if (!c) throw new Error("useHelper must be inside HelperProvider");
  return c;
}

type Msg = { from: "pixel" | "me"; text: string; chips?: string[] };

const WELCOME: Msg = {
  from: "pixel",
  text: "Hi explorer! 👋 I'm Pixel, your club helper. Ask me anything — maths, science, prompts, websites or our club days!",
  chips: QUICK_CHIPS,
};

export function HelperProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [typing, setTyping] = useState(false);

  const askFn = useServerFn(askPixel);
  const memberFn = useServerFn(askPixelMember);
  const auth = useAuth();
  const storeKey = `pixel-history-${auth.userId ?? "guest"}`;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Msg[] | null;
      setMsgs(Array.isArray(saved) && saved.length ? saved : [WELCOME]);
    } catch {
      setMsgs([WELCOME]);
    }
  }, [storeKey]);
  useEffect(() => {
    if (msgs.length > 1) localStorage.setItem(storeKey, JSON.stringify(msgs.slice(-40)));
  }, [msgs, storeKey]);
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;

  const ask = (q: string) => {
    const question = q.trim().slice(0, 300);
    if (!question) return;
    setOpen(true);
    const history = msgsRef.current.slice(1).map((m) => ({ from: m.from, text: m.text }));
    setMsgs((m) => [...m, { from: "me", text: question }]);
    setTyping(true);
    const offline = answerQuestion(question);
    const me = auth.profile ? `Name: ${auth.profile.display_name}. Roles: ${auth.roles.join(", ") || "visitor"}.` : "";
    (auth.userId ? memberFn({ data: { question, history } }) : askFn({ data: { question, history, me } }))
      .then((r) => r.text)
      .catch(() => null)
      .then((text) => {
        setTyping(false);
        setMsgs((m) => [...m, { from: "pixel", text: text ? text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/gm, "") : offline.text, chips: offline.followUps }]);
      });
  };

  return (
    <HelperCtx.Provider value={{ open, setOpen, ask }}>
      {children}
      <HelperWidget msgs={msgs} typing={typing} />
    </HelperCtx.Provider>
  );
}

function HelperWidget({ msgs, typing }: { msgs: Msg[]; typing: boolean }) {
  const { open, setOpen, ask } = useHelper();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, typing, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const lastChips = [...msgs].reverse().find((m) => m.chips)?.chips ?? QUICK_CHIPS;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close the Pixel helper" : "Open the Pixel helper"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-[60] grid h-16 w-16 place-items-center rounded-full bg-brand text-3xl shadow-lift transition hover:scale-110 active:scale-95",
          !open && "animate-pulse-ring",
        )}
      >
        <span aria-hidden="true">{open ? "✖️" : "🤖"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Pixel, your club helper"
          className="fixed inset-0 z-[70] flex h-dvh flex-col overflow-hidden border bg-card shadow-lift animate-in slide-in-from-bottom-8 fade-in-0 sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[560px] sm:w-[380px] sm:rounded-3xl"
        >
          <div className="flex items-center gap-3 bg-brand px-4 py-3 text-primary-foreground">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-card">
              <PixelRobot className="h-9 w-9" />
            </span>
            <div className="flex-1">
              <p className="font-display text-lg font-semibold leading-tight">Pixel</p>
              <p className="text-sm opacity-90">Your club helper</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                btnRef.current?.focus();
              }}
              aria-label="Close helper"
              className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-card/20"
            >
              <X />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted px-4 py-4" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
                <p
                  className={cn(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[0.98rem] shadow-sm animate-pop",
                    m.from === "me" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card text-foreground",
                  )}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {typing && (
              <div className="flex gap-1 rounded-2xl bg-card px-4 py-3 shadow-sm w-fit" aria-label="Pixel is typing">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="typing-dot h-2 w-2 rounded-full bg-primary"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t bg-card px-3 pb-3 pt-2">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {lastChips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => ask(c)}
                  className="shrink-0 rounded-full border border-primary/30 bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
                >
                  {c}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                ask(text);
                setText("");
              }}
            >
              <label htmlFor="pixel-input" className="sr-only">
                Ask Pixel a question
              </label>
              <input
                id="pixel-input"
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
                placeholder="Ask me anything about the club…"
                className="min-h-11 flex-1 rounded-full border bg-background px-4 text-base outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Send question"
                className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              🔒 Please don't type your full name, address or phone number.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
