// All club content lives here. Edit text, winners, Day 6 and photos in this file.
// Facts come only from the club's own notes. Never add student ID numbers.

import showOffDay from "@/assets/show-off-day.webp.asset.json";
import drawingCrafting from "@/assets/drawing-crafting.webp.asset.json";
import mentorsTeaching from "@/assets/mentors-teaching.webp.asset.json";
import computerLab from "@/assets/computer-lab.webp.asset.json";
import artWallLab from "@/assets/art-wall-lab.webp.asset.json";
import thumbsUpLab from "@/assets/thumbs-up-lab.webp.asset.json";
import worksheetGood from "@/assets/worksheet-good-prompt.webp.asset.json";
import worksheetBuilder from "@/assets/worksheet-prompt-builder.webp.asset.json";

export const CONFIG = {
  brand: "Math Blog Club",
  subtitle: "AI Explorers Learning Journey",
  tagline: "Learning AI Through Creativity, Exploration & Hands-on Projects",
  school: "Aga Khan School, Garden",
  city: "Karachi, Pakistan",
  classLabel: "Class 4C",
  classCode: "4-C-PS",
  year: "2026 – 2027",
  founderBadge: "Cool Founder: Salman",
  /** "full" shows full names, "short" shows first name + family initial. */
  nameDisplay: "full" as "full" | "short",
};

export type FunColor = "blue" | "amber" | "purple" | "green" | "pink" | "teal";

export const FOUNDER = {
  name: "Muhammad Salman",
  short: "Salman",
  className: "10B",
  role: "Founder & lead mentor",
  line: "He started this club to help young explorers discover AI with creativity — and he built this website for the class.",
};

export const MENTORS: { name: string; className: string; emoji: string; color: FunColor; line: string }[] = [
  { name: "Lavanya", className: "7B", emoji: "✨", color: "pink", line: "Peer educator and a friendly guide for our explorers." },
  { name: "Ekta", className: "7B", emoji: "🎨", color: "teal", line: "Peer educator who cheered on every explorer." },
  { name: "Meer Fahad", className: "10A", emoji: "🧩", color: "amber", line: "Peer educator who helped explorers learn step by step." },
];

export const TEACHER = { name: "Miss Sana Kashif", role: "Facilitator", emoji: "🍎" };

export const ROSTER: string[] = [
  "Mehtab Ud Deen Didar Jan",
  "Muhammad Azhan Pardar Adeel",
  "Muhammad Hamdaan Malik",
  "Muhammad Ibrahim Shams Ali",
  "Muhammad Khizer Muhammad Hanif",
  "Muhammad Yaseen Muhammad Humair",
  "Muneebah Muhammad Salman",
  "Nabeeha Hayat Khan",
  "Naeel Aziz Amir Ali Khwaja",
  "Noorul Emaan Noman Nasir",
  "Razeen Noorddin Nasrullah",
  "Rohan Ahmed Rehan Ahmed",
  "Ruhab Muhammad Saqib",
  "Saadi Sher Afzal",
  "Samrana Zeeshan Lakhpati",
  "Sara Damani Faizan Suleman Damani",
  "Shan Saeed Saeed Hussain",
  "Sinan Karim Ajmal Karim",
  "Soha Salman",
  "Syeda Aizah Salman Syed",
  "Umm E Hani Muhammad Burhan",
  "Urooj Umair",
  "Zunaira Fayyaz",
  "Haniya Asif",
  "Hanya Fatima",
];

export function displayName(full: string, mode = CONFIG.nameDisplay): string {
  if (mode === "full") return full;
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  return `${parts[0]} ${(parts[parts.length - 1] ?? "")[0] ?? ""}.`;
}

export function filterRoster(names: string[], query: string): string[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return names;
  return names.filter((n) => {
    const lower = n.toLowerCase();
    return words.every((w) => lower.includes(w));
  });
}

export const STATS = [
  { value: ROSTER.length, label: "Explorers", emoji: "🧒" },
  { value: 4, label: "Mentors", emoji: "🧑‍🏫" },
  { value: 1, label: "Teacher", emoji: "🍎" },
  { value: 12, label: "Days", emoji: "📅" },
];

export type DayTag = "explore" | "paper" | "prompt" | "computer" | "test" | "showcase";

export const TAGS: Record<DayTag, { label: string; emoji: string; color: FunColor }> = {
  explore: { label: "Explore Day", emoji: "🧭", color: "teal" },
  paper: { label: "Paper Day", emoji: "✏️", color: "amber" },
  prompt: { label: "Prompt Day", emoji: "💬", color: "purple" },
  computer: { label: "Computer Day", emoji: "💻", color: "blue" },
  test: { label: "Test Day", emoji: "✅", color: "green" },
  showcase: { label: "Showcase Day", emoji: "🌟", color: "pink" },
};

export type Day = {
  n: number;
  title: string;
  tag: DayTag;
  placeholder?: boolean;
  objective: string;
  did: string[];
  materials?: string[];
  homework?: string;
  fact?: string;
  quiz?: { q: string; options: string[]; answer: number };
  learn?: { q: string; a: string }[];
};

export const DAYS: Day[] = [
  {
    n: 1,
    title: "What is a Website?",
    tag: "explore",
    objective: "Understand what a website is and how it works.",
    did: [
      "Learned about the Internet and what a website is.",
      "Compared a website and an app.",
      "Looked at examples: Google, YouTube, Wikipedia and the school website.",
      "Found webpages, the homepage, links and buttons.",
      "The teacher opened 2–3 child-friendly websites for us to observe.",
      "Filled in the “Website Explorer” worksheet: name, use, pictures and buttons.",
    ],
    materials: ["Pencil", "Eraser", "Colour pencils or crayons", "Clipboard / writing board if needed", "Website Explorer worksheet"],
    homework: "Find 3–5 websites you or your family use and write or draw what each one is used for.",
    fact: "The very first page you see on a website is called the homepage!",
    quiz: { q: "Which one is a website?", options: ["Wikipedia", "A pencil", "A school bag"], answer: 0 },
  },
  {
    n: 2,
    title: "How AI Can Make a Website",
    tag: "paper",
    objective: "Learn that AI is a smart helper that can create websites.",
    did: [
      "Learned that AI is a smart computer helper that follows our instructions.",
      "Saw that we tell AI the topic, colours, pictures and pages.",
      "Watched the teacher show AI creating a simple website.",
      "Drew “Build Your Dream Website” on paper shaped like a computer screen, with a website name, logo, pictures, buttons and our favourite colours.",
      "Presented our dream website in one minute.",
      "Played “AI Says!” — like Simon Says, but we draw the instruction!",
    ],
    materials: ["A4 drawing sheet", "Pencil", "Eraser", "Colour pencils / crayons", "Sketch pens", "Ruler"],
    homework: "Ask your family which website they use the most, then write or draw the answer.",
    fact: "AI follows our instructions — so clear instructions help it do a great job.",
    quiz: { q: "What is AI?", options: ["A smart computer helper", "A type of crayon", "A school subject book"], answer: 0 },
  },
  {
    n: 3,
    title: "What Do We Need to Make a Website?",
    tag: "paper",
    objective: "Understand the basic things needed to make a website.",
    did: [
      "Listed what we need: computer, internet, AI, an idea, pictures, text, colours and a website name.",
      "Learned that publishing is like putting our drawing on the school notice board.",
      "Saw a website before and after it was published.",
      "Made a “Website Builder Craft” ✂️ with coloured paper, stickers, cut-outs, buttons and labels.",
      "Held a Website Exhibition and voted with one star sticker for a favourite (not our own!).",
    ],
    materials: ["A4 chart paper", "Pencil", "Eraser", "Colour pencils / crayons", "Sketch pens", "Glue stick", "Child-safe scissors", "Old magazines", "Stickers (optional)", "Coloured paper (optional)"],
    fact: "Publishing a website means putting it online so everyone can see it.",
    quiz: { q: "Publishing a website is like…", options: ["Hiding a drawing in a drawer", "Putting a drawing on the notice board", "Throwing paper away"], answer: 1 },
  },
  {
    n: 4,
    title: "Planning Our Website (Paper First)",
    tag: "paper",
    objective: "Understand that every website starts with a plan.",
    did: [
      "Learned what website planning is.",
      "Found out why designers draw before they create.",
      "Discussed which pages every website should have.",
      "Compared a planned sketch with the final website.",
      "Made a “Website Blueprint” in pairs: name, logo, Home, About, Gallery, Contact, colours and buttons.",
    ],
    materials: ["A4 sheet", "Pencil", "Eraser", "Colours", "Ruler"],
    fact: "Designers draw a plan first — a website blueprint is like a map for building.",
    quiz: { q: "What do designers do before creating a website?", options: ["Make a plan", "Go to sleep", "Delete everything"], answer: 0 },
  },
  {
    n: 5,
    title: "What is a Prompt?",
    tag: "prompt",
    objective: "Understand what a prompt is.",
    did: [
      "Learned that a prompt is “the instruction or question we give to an AI to tell it what we want it to do.” Example: “Write a story about a brave girl.”",
      "Learned the Prompt Formula: Topic + Audience + Colours + Pages + Style + Features.",
      "Compared weak and strong prompts with the teacher.",
      "Did a 5-minute reading activity and a prompt card activity.",
      "Played the “Prompt Builder Challenge”: in pairs, we arranged prompt cards and wrote one complete website prompt.",
      "Asked questions and solved doubts together.",
    ],
    materials: ["Prompt Builder cards", "Prompt worksheet", "Notebook", "Pencil", "Whiteboard and marker"],
    homework: "Write two website prompts using the Prompt Formula.",
    fact: "A clear prompt gives better, more accurate and more useful results.",
    learn: [
      { q: "What is a prompt?", a: "The instruction or question we give to an AI to tell it what we want it to do. Example: “Write a story about a brave girl.”" },
      { q: "Why is a prompt important?", a: "It helps AI understand exactly what we want. A clear prompt gives better, more accurate and more useful results." },
      { q: "What are the elements of a good prompt?", a: "Clear instructions · context · specific details · desired format or style." },
      { q: "How do we write a good prompt?", a: "Give clear instructions · add all important details · explain what you want the AI to create · mention design, features and style · specify the desired output." },
      { q: "How do we write a professional prompt?", a: "Be clear and specific · give complete and important details · organise your instructions · mention the required format or style · clearly state the expected result." },
      { q: "Weak prompt or strong prompt?", a: "A weak prompt has unclear instructions, few details and no context, so it gives a general result. A strong prompt has clear instructions, specific details and proper context, so it gives an accurate and useful result." },
    ],
    quiz: { q: "Which is part of the Prompt Formula?", options: ["Audience", "Lunchbox", "Shoes"], answer: 0 },
  },
  {
    n: 6,
    title: "Pit-stop day",
    tag: "paper",
    placeholder: true,
    objective: "Our class notes for this day will be added soon. 🛠️",
    did: [],
  },
  {
    n: 7,
    title: "Prompt Challenge",
    tag: "prompt",
    objective: "Learn to identify good and bad prompts.",
    did: [
      "The teacher showed four prompts on the board.",
      "We decided ✅ which was best and ❌ which needed improvement — and explained why.",
      "Played “Prompt Doctor”: each team got a poor prompt like “Make a website.” and improved it.",
      "The teacher discussed every team's answer.",
    ],
    materials: ["Prompt Challenge worksheets"],
    fact: "A “Prompt Doctor” makes weak prompts strong by adding details.",
    quiz: { q: "Which prompt needs improvement?", options: ["Make a website.", "Create a blue math club website with Home and Gallery pages.", "Both are perfect"], answer: 0 },
  },
  {
    n: 8,
    title: "First Time on Lovable",
    tag: "computer",
    objective: "Learn how the AI website builder works.",
    did: [
      "Opened Lovable and learned how to create a project.",
      "Found where to type the prompt, the Generate button and the Preview.",
      "Learned that AI has limits, so we must think carefully before generating.",
      "Explored Lovable only — no website generation yet. The teacher showed one example.",
      "Compared our written prompt with the teacher's prompt.",
    ],
    materials: ["Laptop", "Booklet (made by students on Day 1)"],
    fact: "The Preview shows what your website looks like before anyone else sees it.",
    quiz: { q: "Why do we think carefully before clicking Generate?", options: ["Because AI has limits", "Because the button is heavy", "Because it is lunchtime"], answer: 0 },
  },
  {
    n: 9,
    title: "Generate Our Website",
    tag: "computer",
    objective: "Generate the website using the final prompt.",
    did: [
      "The teacher checked every group's prompt before anyone clicked Generate.",
      "Each pair typed one final prompt and clicked Generate.",
      "We watched and observed the result.",
      "We wrote down: What did AI do well? What surprised you?",
    ],
    fact: "The teacher checked every prompt first — a good prompt saves time!",
    quiz: { q: "Who checked our prompts before Generate?", options: ["The teacher", "Nobody", "A robot dog"], answer: 0 },
  },
  {
    n: 10,
    title: "One Final Improvement",
    tag: "computer",
    objective: "Learn that designers improve their work.",
    did: [
      "The teacher asked AI for one improvement, like “Make the buttons bigger.” or “Use lighter colours.”",
      "Each team made ONE improvement only — so we chose carefully.",
      "We compared Before → After. Which looks better? Why?",
    ],
    fact: "Great designers improve their work one careful step at a time.",
    quiz: { q: "How many improvements did each team make?", options: ["One", "Twenty", "None"], answer: 0 },
  },
  {
    n: 11,
    title: "Website Testing",
    tag: "test",
    objective: "Test a website like a designer.",
    did: [
      "Teams exchanged laptops.",
      "Each team checked another team's website with a checklist.",
      "✔ Pages · ✔ Buttons · ✔ Colours · ✔ Pictures · ✔ Easy to understand",
    ],
    fact: "Testing someone else's website helps you spot things the maker might miss.",
    quiz: { q: "Which is on the testing checklist?", options: ["Buttons", "Sandwiches", "Football"], answer: 0 },
  },
  {
    n: 12,
    title: "Website Showcase",
    tag: "showcase",
    objective: "Present our websites to everyone.",
    did: [
      "Shared our website name and why we chose the topic.",
      "Explained how we planned it and how we wrote the prompt.",
      "Showed what AI created.",
      "Celebrated with the club awards! 🏆",
    ],
    fact: "Explaining your work out loud is a super skill called presenting.",
    quiz: { q: "What did we do on Day 12?", options: ["Presented our websites", "Went swimming", "Planted trees"], answer: 0 },
  },
];

export const ACHIEVEMENTS = [
  { emoji: "🌐", text: "Know what a website is" },
  { emoji: "🤖", text: "Understand that AI can help make websites" },
  { emoji: "🎨", text: "Design their own website on paper" },
  { emoji: "👀", text: "Explore real websites" },
  { emoji: "🗣️", text: "Present their ideas confidently" },
  { emoji: "🏅", text: "Take part in fun games, crafts and a mini website exhibition" },
];

export const STEPS = [
  { emoji: "💡", label: "Idea" },
  { emoji: "✏️", label: "Plan on paper" },
  { emoji: "💬", label: "Write a prompt" },
  { emoji: "⚡", label: "Generate" },
  { emoji: "🔧", label: "Improve" },
  { emoji: "✅", label: "Test" },
  { emoji: "🌟", label: "Showcase" },
];

export const AWARDS: { title: string; emoji: string; color: FunColor; winner: string | null }[] = [
  // Add a winner by replacing null with the name, e.g. winner: "Team Rocket"
  { title: "Best Prompt Writer", emoji: "✍️", color: "purple", winner: null },
  { title: "Best Website Design", emoji: "🎨", color: "pink", winner: null },
  { title: "Best Teamwork", emoji: "🤝", color: "green", winner: null },
  { title: "Most Creative Idea", emoji: "💡", color: "amber", winner: null },
  { title: "Best Presentation", emoji: "🎤", color: "blue", winner: null },
];

export type Photo = { src: string; alt: string; caption: string; width: number; height: number; emoji: string };

export const PHOTOS: Photo[] = [
  {
    src: computerLab.url,
    width: 1200,
    height: 1200,
    emoji: "💻",
    caption: "Computer lab day",
    alt: "Collage of twelve photos in the computer lab: children at screens giving thumbs-up, mentors and the teacher helping, and a Math Blog Club banner.",
  },
  {
    src: showOffDay.url,
    width: 899,
    height: 1599,
    emoji: "🏅",
    caption: "Show-off day",
    alt: "Students in school uniform proudly holding up colourful paper website designs in front of a whiteboard with a hand-drawn website diagram.",
  },
  {
    src: drawingCrafting.url,
    width: 899,
    height: 1599,
    emoji: "🖍️",
    caption: "Drawing and crafting",
    alt: "Collage of six photos: students drawing and crafting on paper at their desks while a teacher and a mentor help.",
  },
  {
    src: mentorsTeaching.url,
    width: 1200,
    height: 1200,
    emoji: "🧑‍🏫",
    caption: "Mentors teaching",
    alt: "Collage of six photos: mentors presenting and writing on the whiteboard, a class rules poster, and students working with paper.",
  },  {
    src: thumbsUpLab.url,
    width: 1400,
    height: 1400,
    emoji: "👍",
    caption: "Thumbs up in the lab",
    alt: "Collage of photos in the computer lab: explorers giving thumbs-up next to their screens, and a group photo with the teacher.",
  },
  {
    src: artWallLab.url,
    width: 1400,
    height: 1400,
    emoji: "🎨",
    caption: "Building by the art wall",
    alt: "Collage of explorers in coloured house shirts working at computers in front of a bright painted art wall.",
  },
];

export const WORKSHEETS: (Photo & { title: string; description: string; used: string })[] = [
  {
    src: worksheetGood.url,
    width: 1080,
    height: 1290,
    emoji: "📝",
    caption: "Good Prompt, Great Result!",
    title: "Good Prompt, Great Result!",
    alt: "Colourful worksheet titled Good Prompt, Great Result, with a good versus bad prompt table, tips and an activity.",
    description:
      "Explains what a prompt is and what makes a good one, then compares bad and good prompts for four tasks: a school club website, a poster, writing about AI and suggesting a gift.",
    used: "We read each bad prompt and rewrote it as a good prompt.",
  },
  {
    src: worksheetBuilder.url,
    width: 1024,
    height: 1536,
    emoji: "🧩",
    caption: "AI Prompt Builder",
    title: "AI Prompt Builder",
    alt: "Colourful worksheet with twelve numbered slots and twelve cut-out prompt cards such as Colors, Pages, Audience and Purpose.",
    description: "Twelve cut-out prompt cards and twelve numbered slots. Arrange the cards to build one complete website prompt, then try the challenge card.",
    used: "In pairs, we cut out the cards and arranged them into a full prompt. Try it in the Playground!",
  },
];

/* ---------- Playground content ---------- */

export const PUZZLE_CARDS: { id: string; label: string; text: string; color: FunColor }[] = [
  { id: "type", label: "Website Type", text: "Create a website for a school math club.", color: "blue" },
  { id: "purpose", label: "Purpose", text: "To share club activities, updates and helpful resources.", color: "teal" },
  { id: "audience", label: "Audience", text: "It is for students, parents and teachers.", color: "green" },
  { id: "pages", label: "Pages", text: "It should have Home, About, Activities, Gallery and Contact pages.", color: "purple" },
  { id: "title", label: "Title", text: "Use a clear and attractive title on the homepage.", color: "amber" },
  { id: "colors", label: "Colors", text: "Use blue, purple and white as the main colors.", color: "pink" },
  { id: "design", label: "Design/Look", text: "Use a modern and colorful design.", color: "blue" },
  { id: "images", label: "Images", text: "Use images of students learning and having fun.", color: "teal" },
  { id: "features", label: "Features", text: "Add buttons, image slider and a contact form.", color: "green" },
  { id: "style", label: "Style", text: "Keep the language simple, clear and friendly.", color: "purple" },
  { id: "contact", label: "Contact", text: "Write friendly and motivating text for students.", color: "amber" },
  { id: "extra", label: "Extra", text: "Make it responsive so it looks good on mobile and tablet.", color: "pink" },
];

export const PROMPT_PAIRS = [
  {
    task: "Build a website for a school club",
    emoji: "🖥️",
    bad: "Make a website.",
    good: "Create a website for a school math club. It should have Home, About Us, Activities, Gallery and Contact pages. Use blue and white colors and a modern design.",
    why: "It tells the topic, pages, colors and design style clearly.",
  },
  {
    task: "Make a poster for an event",
    emoji: "🎨",
    bad: "Make a poster.",
    good: "Design a poster for a Math Fun Day event in our school on 15th July. Use bright colors and add date, time and school name.",
    why: "It gives all the important details like event name, date, what to include and style.",
  },
  {
    task: "Write about AI",
    emoji: "🤖",
    bad: "Write about AI.",
    good: "Write 4-5 lines for school students about Artificial Intelligence in simple words with one example.",
    why: "It tells how many lines, for whom, how to write and asks for an example.",
  },
  {
    task: "Suggest a gift for my friend",
    emoji: "🎁",
    bad: "Suggest a gift.",
    good: "Suggest a birthday gift for my best friend who loves drawing and is 13 years old. Give 3 options with reasons.",
    why: "It includes the person's age, interest and asks for options with reasons.",
  },
];

export const DOCTOR_PROMPTS = ["Make a timetable.", "Write about Earth.", "Make a story.", "Make a website."];

export const PROMPT_TIPS = [
  "Be clear and specific.",
  "Add important details (who, what, where, when, how).",
  "Tell the format or style you want.",
  "Ask for the length or number if needed.",
  "Think: What information does the AI need to help me best?",
];

export const TEST_CHECKLIST = ["Pages", "Buttons", "Colours", "Pictures", "Easy to understand"];

/* ---------- Teacher planning notes (from the club PDF, shown only on the teacher page) ---------- */

export const TEACHER_PLANNING = {
  perDay: [
    { day: 1, note: "Live worksheet (ppt)" },
    { day: 2, note: "Colour paper" },
    { day: 3, note: "Printout websites and accessories" },
    { day: 4, note: "Online activity and how to make websites" },
  ],
  thingsRequired: ["Making groups", "Online worksheet", "Booklet", "Attendance sheet", "Making parts", "Badges", "Laptops", "Multimedia"],
};
