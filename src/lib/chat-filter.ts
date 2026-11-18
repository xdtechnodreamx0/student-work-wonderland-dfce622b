// Simple child-safety checks for the class chat.
const BAD = ["stupid", "idiot", "dumb", "hate you", "shut up", "kill", "ugly", "loser", "damn", "hell"];
const PERSONAL = [/\b\d{7,}\b/, /@[a-z0-9-]+\.[a-z]{2,}/i, /\bpassword\b/i, /https?:\/\//i, /www\./i];

export function cleanChat(raw: string): { ok: true; text: string } | { ok: false; reason: string } {
  const text = raw.trim().replace(/\s+/g, " ").slice(0, 300);
  if (!text) return { ok: false, reason: "Write something first." };
  const low = text.toLowerCase();
  if (BAD.some((w) => new RegExp(`\\b${w}\\b`).test(low))) return { ok: false, reason: "Let's use kind words only. 💛" };
  if (PERSONAL.some((r) => r.test(text))) return { ok: false, reason: "Please don't share numbers, emails, links or passwords." };
  return { ok: true, text };
}
