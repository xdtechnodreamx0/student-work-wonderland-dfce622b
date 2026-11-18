// Local, rule-based prompt scorer for the Prompt Doctor game. Nothing is stored or sent.

export type FormulaPart = "topic" | "audience" | "colours" | "pages" | "style" | "features";

export const FORMULA: { id: FormulaPart; label: string; emoji: string; tip: string }[] = [
  { id: "topic", label: "Topic", emoji: "🎯", tip: "Say what it is about (like a math club, the zoo or space)." },
  { id: "audience", label: "Audience", emoji: "👥", tip: "Say who it is for (students, parents or teachers)." },
  { id: "colours", label: "Colours", emoji: "🎨", tip: "Pick some colours (like blue and white)." },
  { id: "pages", label: "Pages", emoji: "📄", tip: "Name the pages or parts (Home, About, Gallery…)." },
  { id: "style", label: "Style", emoji: "✨", tip: "Choose a style (modern, playful, simple, friendly…)." },
  { id: "features", label: "Features", emoji: "🧰", tip: "Add features or details (buttons, pictures, 5 lines, an example…)." },
];

const WORDS: Record<FormulaPart, string[]> = {
  topic: ["math", "club", "school", "zoo", "animal", "animals", "book", "hobby", "earth", "planet", "space", "science", "story", "timetable", "birthday", "sports", "football", "cricket", "food", "nature", "class", "dragon", "princess", "robot", "garden"],
  audience: ["student", "students", "kid", "kids", "children", "child", "parent", "parents", "teacher", "teachers", "friend", "friends", "family", "class", "grade", "everyone", "people", "readers", "year"],
  colours: ["blue", "red", "green", "yellow", "orange", "purple", "pink", "white", "black", "brown", "grey", "gray", "bright", "light", "dark", "rainbow", "gold"],
  pages: ["home", "about", "gallery", "contact", "page", "pages", "section", "sections", "monday", "tuesday", "subjects", "chapters", "beginning", "end", "lines", "paragraph", "paragraphs"],
  style: ["modern", "playful", "minimal", "simple", "fun", "friendly", "funny", "colourful", "colorful", "clean", "cute", "cool", "neat", "easy", "exciting", "happy", "short", "clear", "style"],
  features: ["button", "buttons", "picture", "pictures", "image", "images", "slider", "form", "mobile", "video", "table", "list", "example", "examples", "facts", "drawing", "drawings", "photos", "game", "games", "time", "times", "characters", "title", "icons", "emoji"],
};

export function scorePrompt(text: string): { found: FormulaPart[]; missing: FormulaPart[]; stars: number } {
  const words = new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  );
  // A number counts as a detail only when it counts something, like "5 lines" or "3 options" (not "4th-grade").
  const hasNumber = /\b\d+\s+[a-z]/i.test(text);
  const found: FormulaPart[] = [];
  for (const part of FORMULA) {
    const hit = WORDS[part.id].some((w) => words.has(w)) || (part.id === "features" && hasNumber);
    if (hit) found.push(part.id);
  }
  const missing = FORMULA.map((f) => f.id).filter((id) => !found.includes(id));
  return { found, missing, stars: found.length };
}

export function cheer(stars: number): string {
  if (stars >= 6) return "WOW! A super-strong prompt — all 6 stars! 🌟";
  if (stars >= 4) return "Great job! Your prompt is getting strong. 💪";
  if (stars >= 2) return "Nice start! Add a few more details to make it shine. ✨";
  return "Good try! Let's add more details — try the tips below. 😊";
}
