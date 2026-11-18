import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EyeOff, Eye, Send, Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/club/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { canEditContent, ROLE_EMOJI, type ClubRole } from "@/lib/accounts";
import { cleanChat } from "@/lib/chat-filter";
import { useServerFn } from "@tanstack/react-start";
import { askPixelInChat } from "@/lib/staff-ai.functions";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => pageMeta("Class chat", "The Math Blog Club class chat for signed-in members."),
  component: Chat,
});

function Chat() {
  const auth = useAuth();
  const qc = useQueryClient();
  const staff = canEditContent(auth.roles);
  const lead = auth.roles.includes("teacher") || auth.roles.includes("admin");
  const [text, setText] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const aiFn = useServerFn(askPixelInChat);
  const listRef = useRef<HTMLDivElement>(null);

  const msgs = useQuery({
    queryKey: ["chat"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data.reverse();
    },
  });

  useEffect(() => {
    const ch = supabase
      .channel(`chat-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => qc.invalidateQueries({ queryKey: ["chat"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs.data]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (aiMode) {
      if (!text.trim()) return;
      setAiBusy(true);
      try {
        await aiFn({ data: { question: text } });
        setText("");
        setAiMode(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Pixel couldn't answer.");
      } finally {
        setAiBusy(false);
        qc.invalidateQueries({ queryKey: ["chat"] });
      }
      return;
    }
    const check = cleanChat(text);
    if (!check.ok) {
      toast.error(check.reason);
      return;
    }
    const { error } = await supabase.from("chat_messages").insert({ body: check.text });
    if (error) {
      toast.error("Message did not send. Try again.");
      return;
    }
    setText("");
    qc.invalidateQueries({ queryKey: ["chat"] });
  };

  const hide = async (id: string, hidden: boolean) => {
    const { error } = await supabase.from("chat_messages").update({ hidden }).eq("id", id);
    if (error) toast.error("Couldn't change that message.");
    qc.invalidateQueries({ queryKey: ["chat"] });
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) toast.error("Couldn't delete that message.");
    qc.invalidateQueries({ queryKey: ["chat"] });
  };

  return (
    <>
      <PageHeader eyebrow="💬 Class chat" emoji="🗨️" title="Our class chat" intro="Be kind, stay on topic and never share personal details. Teachers and mentors can see every message." />
      <Section>
        <div className="mx-auto flex h-[65vh] max-w-3xl flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted p-4" aria-live="polite">
            {(msgs.data ?? []).length === 0 && <p className="text-center text-muted-foreground">No messages yet. Say hi! 👋</p>}
            {(msgs.data ?? []).map((m) => {
              const mine = m.user_id === auth.userId;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-2 shadow-sm", m.author_role === "pixel" ? "border-2 border-fun-purple bg-fun-purple/10" : mine ? "bg-primary text-primary-foreground" : "bg-card", m.hidden && "opacity-50")}>
                    <p className="text-xs font-bold">{m.author_role === "pixel" ? "🤖" : (ROLE_EMOJI[m.author_role as ClubRole] ?? "🧑")} {m.author_name}{m.hidden && " · hidden"}</p>
                    <p className="whitespace-pre-line break-words">{m.body}</p>
                    <div className="mt-1 flex items-center gap-1 text-[0.7rem] opacity-80">
                      <span>{new Date(m.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                      {staff && (
                        <button type="button" onClick={() => hide(m.id, !m.hidden)} aria-label={m.hidden ? "Show message" : "Hide message"} className="ml-auto grid h-7 w-7 place-items-center rounded-full hover:bg-foreground/10">
                          {m.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      )}
                      {lead && (
                        <button type="button" onClick={() => remove(m.id)} aria-label="Delete message" className="grid h-7 w-7 place-items-center rounded-full hover:bg-foreground/10"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {aiMode && (
            <div className="flex items-center gap-2 border-t bg-fun-purple/10 px-4 py-2 text-sm font-semibold animate-in slide-in-from-bottom-2" role="status">
              <span aria-hidden="true">🤖</span>
              <span className="flex-1">{aiBusy ? "Pixel is thinking… everyone will see the answer." : "Asking Pixel in the group chat — your question and Pixel's answer will be posted for everyone."}</span>
              <button type="button" onClick={() => setAiMode(false)} className="underline">Cancel</button>
            </div>
          )}
          <form onSubmit={send} className="flex gap-2 border-t p-3">
            <Button type="button" variant={aiMode ? "default" : "outline"} onClick={() => setAiMode((v) => !v)} aria-pressed={aiMode} aria-label="Ask Pixel AI in the chat" title="Ask Pixel AI">🤖 AI</Button>
            <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={aiMode ? "Ask Pixel anything…" : "Write a kind message…"} aria-label="Message" />
            <Button type="submit" disabled={!text.trim() || aiBusy} aria-label="Send"><Send /></Button>
          </form>
        </div>
      </Section>
    </>
  );
}
