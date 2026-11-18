// Websites made by our team. Videos/posters are short recordings of each site.
import bloomV from "@/assets/projects/math-bloom-champions-preview.mp4.asset.json";
import bloomP from "@/assets/projects/math-bloom-champions-poster.webp.asset.json";
import estV from "@/assets/projects/estimation-game-time-preview.mp4.asset.json";
import estP from "@/assets/projects/estimation-game-time-poster.webp.asset.json";
import blockV from "@/assets/projects/math-block-magic-preview.mp4.asset.json";
import blockP from "@/assets/projects/math-block-magic-poster.webp.asset.json";
import gloryV from "@/assets/projects/numbers-games-and-glory-preview.mp4.asset.json";
import gloryP from "@/assets/projects/numbers-games-and-glory-poster.webp.asset.json";
import lavV from "@/assets/projects/math-lavender-preview.mp4.asset.json";
import lavP from "@/assets/projects/math-lavender-poster.webp.asset.json";
import funV from "@/assets/projects/math-fun-preview.mp4.asset.json";
import funP from "@/assets/projects/math-fun-poster.webp.asset.json";
import firstV from "@/assets/projects/first-math-blog-club-preview.mp4.asset.json";
import firstP from "@/assets/projects/first-math-blog-club-poster.webp.asset.json";

export type Project = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  tags: string[];
  video: string;
  poster: string;
  href: string;
  kind: "live" | "handmade";
  credit?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  { id: "glory", title: "Maths Block Club — Numbers, Games & Glory", emoji: "🧙", featured: true, credit: "Led by Peer Educator Lavanya with club members from Grades 1–5", blurb: "A student-led maths website for Grades 1 to 5 at Aga Khan School Garden, with grade-wise games, quizzes, puzzles and activities that follow our school syllabus.", tags: ["Grades 1–5", "Games", "Quizzes"], video: gloryV.url, poster: gloryP.url, href: "https://numbers-games-and-glory.lovable.app", kind: "live" },
  { id: "bloom", title: "Math Bloom", emoji: "🌸", blurb: "A dreamy, flower-themed maths world with gentle colours and fun practice for young learners.", tags: ["Practice", "Cute design"], video: bloomV.url, poster: bloomP.url, href: "https://math-bloom-champions.lovable.app", kind: "live" },
  { id: "estimation", title: "Maths Gaming Adventure", emoji: "🎮", blurb: "Estimation and number games where the fun adds up — guess, check and level up your maths brain.", tags: ["Estimation", "Games"], video: estV.url, poster: estP.url, href: "https://estimation-game-time.lovable.app", kind: "live" },
  { id: "block", title: "Math Block Club — Quizzes & Tips", emoji: "🧱", blurb: "Quizzes, maths tips and fun challenges, all built in neat colourful blocks.", tags: ["Quizzes", "Tips"], video: blockV.url, poster: blockP.url, href: "https://math-block-magic.lovable.app", kind: "live" },
  { id: "lavender", title: "Math Lavender", emoji: "💜", blurb: "Counting apples, shapes, addition, time and money, multiplication — and a certificate at the end!", tags: ["Grades 1–4", "Handmade"], video: lavV.url, poster: lavP.url, href: "/projects/math-lavender.html", kind: "handmade" },
  { id: "mathfun", title: "Math Fun — Learn, Play, Shine!", emoji: "✨", blurb: "Choose your grade, take a quick quiz and solve puzzles to become a maths star.", tags: ["Quiz", "Puzzles", "Handmade"], video: funV.url, poster: funP.url, href: "/projects/math-fun.html", kind: "handmade" },
  { id: "first", title: "Our first Math Blog Club page", emoji: "🧮", blurb: "Where it all started: maths topics, blog posts, tricks and a challenge of the week.", tags: ["Blog", "Handmade"], video: firstV.url, poster: firstP.url, href: "/projects/first-math-blog-club.html", kind: "handmade" },
];

/** Built-in preview video + poster for each seeded project, looked up by the project's media key. */
export const PROJECT_MEDIA: Record<string, { video: string; poster: string }> = Object.fromEntries(PROJECTS.map((p) => [p.id, { video: p.video, poster: p.poster }]));
