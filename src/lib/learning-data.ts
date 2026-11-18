// Learning Path: five levels from Beginner to Professional. Pure data + rules, safe for browser and server.

export type Lesson = { id: string; title: string; emoji: string; body: string[]; tryIt: string };
export type Question = { q: string; options: string[]; answer: number };
export type Level = {
  id: string;
  name: string;
  emoji: string;
  color: "blue" | "green" | "amber" | "purple" | "pink";
  intro: string;
  lessons: Lesson[];
  challenge: Question[];
};

export const PASS_MARK = 0.7;

export const LEVELS: Level[] = [
  {
    id: "beginner",
    name: "Beginner",
    emoji: "🌱",
    color: "green",
    intro: "Meet AI and learn what a prompt is.",
    lessons: [
      { id: "b1", title: "What is AI?", emoji: "🤖", body: ["AI is a computer program that learned from lots of examples.", "It can help us write, draw and build websites — but it is a tool, not a person.", "AI can make mistakes, so we always check its work."], tryIt: "Tell a friend one thing AI can help with and one thing it can't do." },
      { id: "b2", title: "What is a prompt?", emoji: "💬", body: ["A prompt is the instruction we give to an AI.", "A clear prompt gives a better result. A messy prompt gives a messy result.", "Think of it like ordering food: say exactly what you want!"], tryIt: "Write a one-line prompt asking for a poem about the moon." },
      { id: "b3", title: "Staying safe with AI", emoji: "🛡️", body: ["Never type your full name, address, phone number or passwords into an AI.", "If something feels strange or scary, stop and tell a teacher.", "Use AI only with a grown-up or teacher's permission."], tryIt: "List three things you should never share online." },
    ],
    challenge: [
      { q: "What is a prompt?", options: ["A type of computer", "An instruction we give to an AI", "A video game", "A password"], answer: 1 },
      { q: "Can AI make mistakes?", options: ["Never", "Yes, so we check its work", "Only on Sundays", "Only robots can"], answer: 1 },
      { q: "Which is SAFE to type into an AI?", options: ["My home address", "My password", "\"Write a poem about cats\"", "My phone number"], answer: 2 },
      { q: "What gives a better AI result?", options: ["A clear prompt", "A very short random word", "Typing in all capitals", "No prompt at all"], answer: 0 },
    ],
  },
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    color: "blue",
    intro: "Weak vs strong prompts and the Prompt Formula.",
    lessons: [
      { id: "e1", title: "Weak vs strong prompts", emoji: "💪", body: ["Weak: \"Make a website.\"", "Strong: \"Make a colourful website for a Grade 4 math club with Home, About and Games pages.\"", "Strong prompts give details: who, what, colours and pages."], tryIt: "Turn \"Write a story\" into a strong prompt." },
      { id: "e2", title: "The Prompt Formula", emoji: "🧪", body: ["Topic + Audience + Colours + Pages + Style + Features.", "Use as many parts as you can.", "The more parts you use, the closer the AI gets to your idea."], tryIt: "Write a prompt that uses all six parts of the formula." },
      { id: "e3", title: "One change at a time", emoji: "🔧", body: ["When you improve something with AI, ask for ONE change at a time.", "\"Make the buttons bigger\" is better than ten changes at once.", "Check each change before asking for the next."], tryIt: "Write three small improvement prompts for a website." },
    ],
    challenge: [
      { q: "Which prompt is STRONGER?", options: ["Make a website.", "Make a blue website for a Grade 4 math club with Home and Games pages.", "Website pls", "Do something cool"], answer: 1 },
      { q: "What is in the Prompt Formula?", options: ["Topic, Audience, Colours, Pages, Style, Features", "Only colours", "Name and age", "Just the word 'please'"], answer: 0 },
      { q: "How many changes should you ask for at once?", options: ["Ten", "One", "Zero", "As many as possible"], answer: 1 },
      { q: "What does 'audience' mean in a prompt?", options: ["Who the result is for", "The loudness", "The font", "The computer"], answer: 0 },
    ],
  },
  {
    id: "builder",
    name: "Builder",
    emoji: "🧱",
    color: "amber",
    intro: "Plan, build and test a website like a real designer.",
    lessons: [
      { id: "u1", title: "Make a blueprint", emoji: "📐", body: ["A blueprint is a plan on paper before you build.", "Draw the name, logo, pages, colours and buttons.", "Designers always plan first!"], tryIt: "Sketch a blueprint for your dream website." },
      { id: "u2", title: "Every website needs…", emoji: "🏠", body: ["A Home page and an About page.", "Easy buttons, good pictures and clear colours.", "Text that is easy to read for your audience."], tryIt: "Check a website you like: does it have all of these?" },
      { id: "u3", title: "Test like a tester", emoji: "✅", body: ["Click every button. Read every page.", "Check pictures, colours and if it's easy to understand.", "Write down what to fix, then fix one thing at a time."], tryIt: "Test a friend's website and give two kind tips." },
    ],
    challenge: [
      { q: "What is a blueprint?", options: ["A plan you make before building", "A blue printer", "A finished website", "A kind of AI"], answer: 0 },
      { q: "Which page should every website have?", options: ["A secret page", "A Home page", "A password page", "No pages"], answer: 1 },
      { q: "When testing a website you should…", options: ["Only look at the colours", "Click every button and read every page", "Close it quickly", "Delete it"], answer: 1 },
      { q: "Good tips for a friend's website should be…", options: ["Mean", "Kind and helpful", "Secret", "Very long"], answer: 1 },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    emoji: "🚀",
    color: "purple",
    intro: "Write professional prompts and use AI for math thinking.",
    lessons: [
      { id: "p1", title: "Professional prompts", emoji: "🎯", body: ["Be clear and specific. Give complete details.", "Organise your instructions in steps.", "Say the format you want: a list, a table, a short story."], tryIt: "Ask for a 5-question math quiz as a numbered list." },
      { id: "p2", title: "Give an example", emoji: "🧩", body: ["Showing an example helps AI copy your style.", "\"Make 3 riddles like this one: I have 4 sides all equal…\"", "Examples make results more accurate."], tryIt: "Write a prompt that includes one example." },
      { id: "p3", title: "Math with AI", emoji: "➗", body: ["AI can explain math step by step.", "Ask: \"Explain 36 ÷ 4 step by step for a Grade 4 student.\"", "Always try the problem yourself first, then check."], tryIt: "Ask for a step-by-step explanation of 7 × 8." },
    ],
    challenge: [
      { q: "Which makes a prompt professional?", options: ["Being vague", "Clear details and the format you want", "Using emojis only", "Typing fast"], answer: 1 },
      { q: "Why give the AI an example?", options: ["To confuse it", "So it can copy the style you want", "It's not allowed", "To make it slower"], answer: 1 },
      { q: "What is 36 ÷ 4?", options: ["8", "9", "7", "12"], answer: 1 },
      { q: "Best way to learn math with AI?", options: ["Copy answers without thinking", "Try first, then ask AI to explain step by step", "Never do math", "Ask AI to do all homework"], answer: 1 },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    emoji: "🏆",
    color: "pink",
    intro: "Think like a responsible AI creator.",
    lessons: [
      { id: "x1", title: "Check facts", emoji: "🔍", body: ["AI can sound sure even when it's wrong.", "Check important facts in a book or ask your teacher.", "A good creator double-checks."], tryIt: "Find one fact and check it in a second place." },
      { id: "x2", title: "Be fair and kind", emoji: "💛", body: ["Use AI to help, never to hurt or tease anyone.", "Give credit: say when AI helped you.", "Respect other people's work and ideas."], tryIt: "Write one sentence saying how AI helped your project." },
      { id: "x3", title: "Build for others", emoji: "🌍", body: ["The best websites help other people.", "Think: who will use it? What do they need?", "Ask real users for feedback and improve."], tryIt: "Plan a website that helps younger students learn math." },
    ],
    challenge: [
      { q: "If AI tells you a fact, you should…", options: ["Always believe it", "Check it in another place", "Ignore it", "Share it everywhere"], answer: 1 },
      { q: "When AI helped your project you should…", options: ["Hide it", "Say that AI helped", "Blame AI", "Delete the project"], answer: 1 },
      { q: "The best websites…", options: ["Help other people", "Have no pages", "Are secret", "Only use one colour"], answer: 0 },
      { q: "What is 125 + 375?", options: ["400", "500", "450", "550"], answer: 1 },
      { q: "A responsible AI creator is…", options: ["Careful, fair and kind", "Careless", "Unkind", "Always in a hurry"], answer: 0 },
    ],
  },
];

export const ALL_LESSON_IDS = LEVELS.flatMap((l) => l.lessons.map((x) => x.id));

export function findLevel(id: string) {
  return LEVELS.find((l) => l.id === id) ?? null;
}

/** A level is open when every earlier level has been passed. */
export function isLevelUnlocked(levelId: string, passed: readonly string[]): boolean {
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx < 0) return false;
  return LEVELS.slice(0, idx).every((l) => passed.includes(l.id));
}

/** The challenge opens once every lesson in the level is done. */
export function isChallengeOpen(level: Level, done: readonly string[]): boolean {
  return level.lessons.every((x) => done.includes(x.id));
}

export function gradeChallenge(level: Level, answers: readonly number[]) {
  const correct = level.challenge.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
  const total = level.challenge.length;
  return { correct, total, passed: correct / total >= PASS_MARK };
}

/** Percent of the whole path finished (lessons + passed challenges). */
export function pathPercent(done: readonly string[], passed: readonly string[]): number {
  const total = ALL_LESSON_IDS.length + LEVELS.length;
  const got = done.filter((d) => ALL_LESSON_IDS.includes(d)).length + passed.filter((p) => findLevel(p)).length;
  return Math.round((got / total) * 100);
}

export function currentLevelName(passed: readonly string[]): string {
  const next = LEVELS.find((l) => !passed.includes(l.id));
  return next ? next.name : "Professional (complete!)";
}
