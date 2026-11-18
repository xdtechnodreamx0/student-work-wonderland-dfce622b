// The four looks of the site. Saved only on this device (no personal data).

export type Mode = "day" | "night" | "party" | "study";

export const MODES: { id: Mode; emoji: string; label: string; text: string }[] = [
  { id: "day", emoji: "☀️", label: "Day", text: "Bright and cheerful" },
  { id: "night", emoji: "🌙", label: "Night", text: "Dark colours, easy on the eyes" },
  { id: "party", emoji: "🎉", label: "Party", text: "Extra colours, balloons and confetti" },
  { id: "study", emoji: "📚", label: "Study", text: "Calm colours, nothing moving, bigger text" },
];

export const MODE_KEY = "mbc_mode";

export function isMode(v: unknown): v is Mode {
  return v === "day" || v === "night" || v === "party" || v === "study";
}

/** Runs before the page paints so the saved look shows straight away (no flash). */
export const MODE_BOOT_SCRIPT = `try{var m=localStorage.getItem("${MODE_KEY}");document.documentElement.dataset.mode=(m==="night"||m==="party"||m==="study")?m:"day"}catch(e){document.documentElement.dataset.mode="day"}`;
