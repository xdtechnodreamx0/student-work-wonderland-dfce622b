// Games Data & Rules for Class 4C Math Blog Club

export type MathQuestion = {
  id: string;
  question: string;
  category: "Multiplication" | "Estimation" | "Fractions" | "Division" | "Geometry";
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const STATIC_MATH_QUESTIONS: MathQuestion[] = [
  {
    id: "m1",
    question: "What is 8 × 7?",
    category: "Multiplication",
    options: ["54", "56", "58", "64"],
    correctIndex: 1,
    explanation: "8 × 7 = 56. Remember: 5, 6, 7, 8 -> 56 = 7 × 8!",
  },
  {
    id: "m2",
    question: "Estimate: 49 + 52 is closest to...",
    category: "Estimation",
    options: ["80", "100", "120", "150"],
    correctIndex: 1,
    explanation: "Round 49 to 50 and 52 to 50: 50 + 50 = 100.",
  },
  {
    id: "m3",
    question: "Which fraction is the largest?",
    category: "Fractions",
    options: ["1/4", "1/2", "1/8", "1/3"],
    correctIndex: 1,
    explanation: "1/2 is half of the whole, which is larger than 1/3, 1/4, or 1/8.",
  },
  {
    id: "m4",
    question: "What is 72 ÷ 8?",
    category: "Division",
    options: ["7", "8", "9", "12"],
    correctIndex: 2,
    explanation: "72 ÷ 8 = 9, because 9 × 8 = 72.",
  },
  {
    id: "m5",
    question: "How many sides does a hexagon have?",
    category: "Geometry",
    options: ["5", "6", "7", "8"],
    correctIndex: 1,
    explanation: "A hexagon has 6 straight sides and 6 vertices.",
  },
  {
    id: "m6",
    question: "Estimate: 19 × 21 is closest to...",
    category: "Estimation",
    options: ["200", "300", "400", "500"],
    correctIndex: 2,
    explanation: "Round 19 to 20 and 21 to 20: 20 × 20 = 400.",
  },
  {
    id: "m7",
    question: "What is 12 × 6?",
    category: "Multiplication",
    options: ["60", "66", "72", "74"],
    correctIndex: 2,
    explanation: "12 × 6 = 72 (10 × 6 = 60 plus 2 × 6 = 12).",
  },
  {
    id: "m8",
    question: "What is 1/4 + 2/4?",
    category: "Fractions",
    options: ["3/8", "3/4", "2/4", "1"],
    correctIndex: 1,
    explanation: "Same denominator: (1 + 2) / 4 = 3/4.",
  },
  {
    id: "m9",
    question: "A square has a side length of 6 cm. What is its perimeter?",
    category: "Geometry",
    options: ["12 cm", "18 cm", "24 cm", "36 cm"],
    correctIndex: 2,
    explanation: "Perimeter = 4 × side length = 4 × 6 = 24 cm.",
  },
  {
    id: "m10",
    question: "What is 81 ÷ 9?",
    category: "Division",
    options: ["7", "8", "9", "11"],
    correctIndex: 2,
    explanation: "81 ÷ 9 = 9, because 9 × 9 = 81.",
  },
  {
    id: "m11",
    question: "Estimate: 302 - 99 is closest to...",
    category: "Estimation",
    options: ["150", "200", "250", "300"],
    correctIndex: 1,
    explanation: "300 - 100 = 200.",
  },
  {
    id: "m12",
    question: "What is 9 × 7?",
    category: "Multiplication",
    options: ["54", "63", "72", "81"],
    correctIndex: 1,
    explanation: "9 × 7 = 63.",
  },
];

export function getRandomMathQuestions(count = 8): MathQuestion[] {
  const shuffled = [...STATIC_MATH_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Prompt Master missions and cards
export type CardSlot = "role" | "task" | "context" | "format";

export type PuzzleComponentCard = {
  id: string;
  slot: CardSlot;
  label: string;
  text: string;
  quality: number; // 1-3 stars contribution
};

export type PromptMission = {
  id: string;
  title: string;
  description: string;
  theme: string;
  requiredSlotCount: number;
};

export const PROMPT_MISSIONS: PromptMission[] = [
  {
    id: "mission-math-game",
    title: "Math Sprint App",
    description: "Build a prompt for an interactive fast-math web app for Class 4C explorers.",
    theme: "Class 4C Math Blog Club",
    requiredSlotCount: 4,
  },
  {
    id: "mission-art-wall",
    title: "Student Showcase Wall",
    description: "Build a prompt to show off student digital posters with friendly voting and search.",
    theme: "Student Work Wonderland",
    requiredSlotCount: 4,
  },
  {
    id: "mission-pixel-buddy",
    title: "Pixel AI Assistant Page",
    description: "Build a prompt for a kid-safe helpful AI tutor with friendly hints and badges.",
    theme: "Pixel Club Mascot",
    requiredSlotCount: 4,
  },
];

export const PUZZLE_SLOT_CARDS: Record<CardSlot, PuzzleComponentCard[]> = {
  role: [
    { id: "r1", slot: "role", label: "Friendly Teacher", text: "Act as an encouraging Grade 4 math teacher and coding mentor.", quality: 3 },
    { id: "r2", slot: "role", label: "Game Developer", text: "Act as a professional educational web game designer.", quality: 3 },
    { id: "r3", slot: "role", label: "Helper Bot", text: "You are a robot helper.", quality: 1 },
    { id: "r4", slot: "role", label: "Math Champion", text: "Act as an enthusiastic math club leader named Pixel.", quality: 3 },
  ],
  task: [
    { id: "t1", slot: "task", label: "Build Quiz Game", text: "Create an interactive mental math sprint with a 60-second timer.", quality: 3 },
    { id: "t2", slot: "task", label: "Build Showcase", text: "Design a responsive showcase gallery with search, tags, and lightbox preview.", quality: 3 },
    { id: "t3", slot: "task", label: "Do Stuff", text: "Make something cool with math.", quality: 1 },
    { id: "t4", slot: "task", label: "Helper Chatbot", text: "Build a friendly chat assistant that gives step-by-step math hints without spoiling answers.", quality: 3 },
  ],
  context: [
    { id: "c1", slot: "context", label: "Class 4C Students", text: "The app is for 9-10 year old students at Aga Khan School using Class 4C math curriculum.", quality: 3 },
    { id: "c2", slot: "context", label: "Vibrant Theme", text: "Use joyful pastel colours (blue, lavender, yellow), big rounded buttons, and sound effects.", quality: 3 },
    { id: "c3", slot: "context", label: "School Parents", text: "For parents and teachers reviewing homework and club progress.", quality: 2 },
    { id: "c4", slot: "context", label: "Anyone", text: "For anyone on the internet.", quality: 1 },
  ],
  format: [
    { id: "f1", slot: "format", label: "Pages + Confetti", text: "Include Home, Play, and Scoreboard screens with confetti celebrations on high scores.", quality: 3 },
    { id: "f2", slot: "format", label: "Step-by-Step", text: "Provide a clean single-page layout with a progress bar and instant feedback badges.", quality: 3 },
    { id: "f3", slot: "format", label: "Text Only", text: "Just put plain text on screen.", quality: 1 },
    { id: "f4", slot: "format", label: "Mobile Responsive", text: "Ensure full touch support with card swipe controls and large tap targets.", quality: 3 },
  ],
};

// Weak vs Strong Arena challenges
export type ArenaPair = {
  id: string;
  task: string;
  promptA: string;
  promptB: string;
  stronger: "A" | "B";
  reason: string;
  points: number;
};

export const ARENA_PAIRS: ArenaPair[] = [
  {
    id: "a1",
    task: "Building a School Math Website",
    promptA: "Make a website for school.",
    promptB: "Create a modern website for our Class 4C Math Blog Club with Home, About, Worksheets, and Games pages using joyful blue and lavender colours.",
    stronger: "B",
    reason: "Prompt B includes topic, specific audience, page structure, and design colours (the Prompt Formula!).",
    points: 15,
  },
  {
    id: "a2",
    task: "Creating a Math Flashcard Game",
    promptA: "Build a multiplication flashcard app with a 30-second timer, 3 difficulty levels, and star ratings for Grade 4 students.",
    promptB: "Make a game that asks math questions quickly.",
    stronger: "A",
    reason: "Prompt A specifies exact math topic (multiplication), time limit, difficulty settings, audience, and rewards.",
    points: 15,
  },
  {
    id: "a3",
    task: "Asking AI for Homework Guidance",
    promptA: "Solve 48 × 15 for me right now.",
    promptB: "Explain step-by-step how to multiply 48 × 15 using the box method, suitable for a 4th grader.",
    stronger: "B",
    reason: "Prompt B asks for educational explanation and method rather than just a bare answer, fostering real understanding.",
    points: 15,
  },
  {
    id: "a4",
    task: "Designing a Club Award Certificate",
    promptA: "Design an award certificate.",
    promptB: "Create a printable certificate for the 'Prompt Master' award in our Math Club with student name line, date, founder signature, and gold star border.",
    stronger: "B",
    reason: "Prompt B names the exact award, required layout fields, signatures, and visual theme.",
    points: 15,
  },
  {
    id: "a5",
    task: "Coding an AI Chatbot Prompt",
    promptA: "Act as Pixel, the friendly Class 4C club mascot. When students ask for help, give encouraging hints and emojis instead of direct answers.",
    promptB: "Help kids with math questions.",
    stronger: "A",
    reason: "Prompt A establishes persona (Pixel), tone (encouraging), target audience, and precise behavior rules.",
    points: 15,
  },
  {
    id: "a6",
    task: "Generating a Practice Worksheet",
    promptA: "Make a math worksheet.",
    promptB: "Generate a 10-question practice sheet on fractions and decimals for Grade 4 with an answer key at the bottom.",
    stronger: "B",
    reason: "Prompt B states question count, specific curriculum topics, grade level, and asks for the answer key.",
    points: 15,
  },
];
