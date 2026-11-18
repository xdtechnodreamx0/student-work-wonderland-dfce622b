// Pixel helper: an offline, child-safe keyword matcher. Nothing is sent anywhere.

export type KBEntry = { id: string; keywords: string[]; answer: string; followUps: string[] };

export const QUICK_CHIPS = [
  "What is a prompt?",
  "What is the Prompt Formula?",
  "What should every website have?",
  "What did we do on Day 9?",
  "How do I improve my website?",
  "Who started the club?",
  "Who are the mentors?",
  "What is Lovable?",
  "What is publishing?",
];

export const HELPER_KB: KBEntry[] = [
  { id: "prompt", keywords: ["what is a prompt", "prompt", "instruction"], answer: "A prompt is the instruction we give to an AI. It tells the AI exactly what we want!", followUps: ["What is the Prompt Formula?", "What is a weak prompt?"] },
  { id: "formula", keywords: ["formula", "prompt formula", "recipe"], answer: "Topic + Audience + Colours + Pages + Style + Features. Use all of these for a super strong prompt!", followUps: ["What is a weak prompt?", "What did we do on Day 5?"] },
  { id: "prompt-why", keywords: ["why prompt important", "why is a prompt important", "prompt important", "important"], answer: "A prompt helps AI understand exactly what we want. A clear prompt gives better, more accurate and more useful results.", followUps: ["What are the elements of a good prompt?", "What is the Prompt Formula?"] },
  { id: "prompt-elements", keywords: ["elements", "elements of a good prompt", "parts of a good prompt", "write a good prompt"], answer: "A good prompt has clear instructions, context, specific details and the format or style you want.", followUps: ["How do I write a professional prompt?", "What is a weak prompt?"] },
  { id: "professional", keywords: ["professional", "professional prompt"], answer: "Be clear and specific, give complete details, organise your instructions, mention the format or style, and clearly say the result you expect.", followUps: ["What are the elements of a good prompt?", "What is the Prompt Formula?"] },
  { id: "sign-in", keywords: ["sign in", "login", "log in", "password", "username", "account", "my page"], answer: "Tap Sign in at the top. Explorers pick their name and make a username — no password! Mentors, the teacher and admin pick their name and type their password. 🔑", followUps: ["What is a prompt?", "Who is the teacher?"] },
  { id: "every-site", keywords: ["every website", "website have", "should have", "need on website", "pages"], answer: "Every website needs a Home page, About page, easy-to-use buttons, good pictures, and clear colours.", followUps: ["What is a blueprint?", "What is a homepage?"] },
  { id: "day9", keywords: ["day 9", "day nine", "generate our website"], answer: "We typed our final prompts into Lovable and clicked Generate! We watched the AI build our ideas.", followUps: ["What did we do on Day 10?", "What is Lovable?"] },
  { id: "improve", keywords: ["improve", "better website", "change", "fix", "improvement"], answer: "Ask AI for ONE change at a time. Like 'Make the buttons bigger' or 'Use lighter colours'.", followUps: ["What did we do on Day 10?", "How do I test a website?"] },
  { id: "founder", keywords: ["founder", "started", "salman", "who made", "built website", "creator"], answer: "The club was started by Muhammad Salman from class 10B. He's our founder and lead mentor — and he built this website! 🚀", followUps: ["Who are the mentors?", "Who is the teacher?"] },
  { id: "mentors", keywords: ["mentors", "mentor", "peer educators", "lavanya", "ekta", "meer", "fahad"], answer: "Our mentors are Muhammad Salman (10B), Lavanya (7B), Ekta (7B) and Meer Fahad (10A). They helped us every step of the way!", followUps: ["Who started the club?", "Who is the teacher?"] },
  { id: "teacher", keywords: ["teacher", "sana", "kashif", "miss", "facilitator"], answer: "Our teacher and facilitator is Miss Sana Kashif. 🍎", followUps: ["Who are the mentors?", "How many explorers are there?"] },
  { id: "roster", keywords: ["how many students", "how many explorers", "students", "explorers", "class", "kids", "roster"], answer: "There are 25 explorers in Class 4C! You can see everyone on the Roster page.", followUps: ["Who are the mentors?", "What are the awards?"] },
  { id: "lovable", keywords: ["lovable", "ai website builder", "builder", "tool"], answer: "Lovable is the AI website builder we used. You type a prompt, click Generate, and check the Preview!", followUps: ["What did we do on Day 8?", "What does generate mean?"] },
  { id: "publishing", keywords: ["publish", "publishing", "published", "notice board"], answer: "Publishing is like putting your drawing on the school notice board — it means everyone can see your website!", followUps: ["What did we do on Day 3?", "What is the internet?"] },
  { id: "ai", keywords: ["what is ai", "ai", "artificial intelligence", "robot", "smart helper"], answer: "AI is a smart computer helper. It follows our instructions — so a clear prompt helps it do a great job!", followUps: ["What is a prompt?", "What did we do on Day 2?"] },
  { id: "web-vs-app", keywords: ["website vs app", "app", "difference", "application"], answer: "A website opens in a web browser using the internet. An app is a program you install on a phone or tablet. We compared them on Day 1!", followUps: ["What is a website?", "What did we do on Day 1?"] },
  { id: "website", keywords: ["what is a website", "website", "websites"], answer: "A website is a group of webpages on the internet, like Google, YouTube or Wikipedia. You open it to learn, watch or play!", followUps: ["What is a homepage?", "What should every website have?"] },
  { id: "blueprint", keywords: ["blueprint", "plan", "planning", "sketch"], answer: "A blueprint is a plan for your website on paper: name, logo, Home, About, Gallery, Contact, colours and buttons. Designers plan first!", followUps: ["What did we do on Day 4?", "What should every website have?"] },
  { id: "weak-strong", keywords: ["weak prompt", "strong prompt", "weak", "strong", "good prompt", "bad prompt"], answer: "A weak prompt is short and unclear, like 'Make a website.' A strong prompt has clear details: topic, audience, colours, pages, style and features!", followUps: ["What is the Prompt Formula?", "What are common prompt mistakes?"] },
  { id: "mistakes", keywords: ["mistakes", "mistake", "wrong", "tips"], answer: "Common mistakes: too few details, no context, and unclear instructions. Tip: be clear, add details, and say what style you want!", followUps: ["What is a weak prompt?", "What is the Prompt Formula?"] },
  { id: "awards", keywords: ["awards", "award", "prize", "trophy", "winner"], answer: "On Day 12 we had five awards: Best Prompt Writer, Best Website Design, Best Teamwork, Most Creative Idea and Best Presentation! 🏆", followUps: ["What did we do on Day 12?", "How do I test a website?"] },
  { id: "testing", keywords: ["test", "testing", "checklist", "check"], answer: "To test a website, check: ✔ Pages ✔ Buttons ✔ Colours ✔ Pictures ✔ Easy to understand. Try the checklist in the Playground!", followUps: ["What did we do on Day 11?", "How do I improve my website?"] },
  { id: "day1", keywords: ["day 1", "day one", "first day"], answer: "Day 1: we learned what a website is, looked at Google, YouTube and Wikipedia, and filled in the Website Explorer worksheet.", followUps: ["What did we do on Day 2?", "What is a website?"] },
  { id: "day2", keywords: ["day 2", "day two", "ai says", "dream website"], answer: "Day 2: we learned AI is a smart helper, drew our Dream Website on paper and played 'AI Says!'", followUps: ["What did we do on Day 3?", "What is AI?"] },
  { id: "day3", keywords: ["day 3", "day three", "craft", "exhibition"], answer: "Day 3: we learned what we need to make a website, made a Website Builder Craft and held a Website Exhibition with star stickers! ⭐", followUps: ["What did we do on Day 4?", "What is publishing?"] },
  { id: "day4", keywords: ["day 4", "day four"], answer: "Day 4: we planned our websites on paper and made a Website Blueprint in pairs.", followUps: ["What did we do on Day 5?", "What is a blueprint?"] },
  { id: "day5", keywords: ["day 5", "day five"], answer: "Day 5: we learned what a prompt is, the Prompt Formula, and played the Prompt Builder Challenge.", followUps: ["What is the Prompt Formula?", "What did we do on Day 7?"] },
  { id: "day6", keywords: ["day 6", "day six"], answer: "Day 6 is our pit-stop day. Its class notes will be added soon! 🛠️", followUps: ["What did we do on Day 7?", "What did we do on Day 5?"] },
  { id: "day7", keywords: ["day 7", "day seven", "prompt doctor", "prompt challenge"], answer: "Day 7: the Prompt Challenge! We spotted good and bad prompts and played Prompt Doctor to fix weak ones.", followUps: ["What did we do on Day 8?", "What is a weak prompt?"] },
  { id: "day8", keywords: ["day 8", "day eight"], answer: "Day 8: our first time on Lovable! We found the prompt box, the Generate button and the Preview — just exploring, no generating yet.", followUps: ["What did we do on Day 9?", "What is Lovable?"] },
  { id: "day10", keywords: ["day 10", "day ten"], answer: "Day 10: each team made ONE final improvement and compared Before and After.", followUps: ["What did we do on Day 11?", "How do I improve my website?"] },
  { id: "day11", keywords: ["day 11", "day eleven"], answer: "Day 11: we swapped laptops and tested each other's websites with a checklist.", followUps: ["What did we do on Day 12?", "How do I test a website?"] },
  { id: "day12", keywords: ["day 12", "day twelve", "showcase", "present"], answer: "Day 12: the Website Showcase! We presented our websites and celebrated with awards. 🌟", followUps: ["What are the awards?", "Who started the club?"] },
  { id: "internet", keywords: ["internet", "online"], answer: "The internet connects computers all over the world, so we can open websites and share things.", followUps: ["What is a website?", "What is publishing?"] },
  { id: "homepage", keywords: ["homepage", "home page", "webpage", "link", "button"], answer: "A webpage is one page of a website. The homepage is the first page you see. Links and buttons take you to other pages!", followUps: ["What should every website have?", "What is a website?"] },
  { id: "generate", keywords: ["generate", "preview"], answer: "Generate tells the AI to build your website from your prompt. Preview lets you look at it before sharing!", followUps: ["What is Lovable?", "What did we do on Day 9?"] },
  { id: "site-help", keywords: ["how use", "this site", "help", "navigate", "playground", "games"], answer: "Use the sidebar to visit pages: Journey for our 12 days, Roster for the explorers, Photos, Worksheets, and the Playground for prompt games!", followUps: ["What is a prompt?", "Who started the club?"] },
  { id: "hello", keywords: ["hello", "hi", "hey", "salam", "assalam"], answer: "Hi there, explorer! 👋 I'm Pixel. Ask me about prompts, websites or our club days!", followUps: ["What is a prompt?", "What did we do on Day 1?"] },
];

const STOP = new Set(["the", "a", "an", "is", "are", "was", "what", "who", "how", "do", "did", "does", "i", "we", "my", "our", "on", "of", "to", "in", "it", "for", "me", "you", "can", "tell", "about", "please", "and"]);
const SYNONYMS: Record<string, string> = { color: "colour", colors: "colours", build: "make", create: "make", made: "make", site: "website", web: "website", teach: "teacher", sir: "teacher" };

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => SYNONYMS[w] ?? w)
    .join(" ");
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((w) => w && !STOP.has(w));
}

const PERSONAL = /(\d[\s-]?){7,}|my (home )?address|my phone|phone number|my number|i live at|my password/i;
const UNSAFE = /\b(kill|hate|weapon|gun|violence|drugs|password|hack|stupid|dumb)\b/i;

export type HelperReply = { kind: "answer" | "unknown" | "privacy" | "unsafe"; text: string; followUps: string[] };

export function answerQuestion(question: string): HelperReply {
  const q = question.trim();
  if (!q) return { kind: "unknown", text: "Type a question or tap a chip below! 😊", followUps: QUICK_CHIPS.slice(0, 3) };
  if (PERSONAL.test(q))
    return { kind: "privacy", text: "Oops! Please keep personal things like phone numbers and addresses private. 🔒 Let's talk about websites and prompts instead!", followUps: QUICK_CHIPS.slice(0, 3) };
  if (UNSAFE.test(q))
    return { kind: "unsafe", text: "Let's keep things kind and friendly! 💙 I can help with websites, prompts and our club days.", followUps: QUICK_CHIPS.slice(0, 3) };

  const norm = ` ${normalize(q)} `;
  const qTokens = new Set(tokens(q));
  let best: KBEntry | null = null;
  let bestScore = 0;
  for (const entry of HELPER_KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      const nk = normalize(kw);
      if (nk.includes(" ")) {
        if (norm.includes(` ${nk} `)) score += 3 + nk.split(" ").length;
      } else if (qTokens.has(nk)) {
        score += 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (!best || bestScore < 2) {
    return { kind: "unknown", text: "Hmm, I'm not sure about that one yet! Try one of these:", followUps: QUICK_CHIPS.slice(0, 4) };
  }
  return { kind: "answer", text: best.answer, followUps: best.followUps };
}
