import { describe, expect, it } from "vitest";
import { ROSTER, DAYS, MENTORS, FOUNDER, TEACHER, AWARDS, displayName, CONFIG } from "@/lib/club-data";
import { answerQuestion } from "@/lib/helper";
import { scorePrompt } from "@/lib/prompt-doctor";

describe("club facts", () => {
  it("shows all 25 explorers", () => {
    expect(ROSTER).toHaveLength(25);
  });
  it("never contains student ID numbers", () => {
    const all = JSON.stringify({ ROSTER, DAYS, MENTORS, FOUNDER, TEACHER, CONFIG });
    expect(all).not.toMatch(/29\d{5}/);
  });
  it("has 12 days with Day 6 as a placeholder", () => {
    expect(DAYS.map((d) => d.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(DAYS.find((d) => d.n === 6)?.placeholder).toBe(true);
  });
  it("lists 3 mentors plus founder Salman of 10B", () => {
    expect(MENTORS.map((m) => m.name)).toEqual(["Lavanya", "Ekta", "Meer Fahad"]);
    expect(FOUNDER.className).toBe("10B");
  });
  it("is Class 4C, never Grade 5", () => {
    expect(JSON.stringify({ DAYS, CONFIG })).not.toMatch(/grade 5/i);
    expect(CONFIG.classLabel).toBe("Class 4C");
  });
  it("has five awards with no invented winners", () => {
    expect(AWARDS).toHaveLength(5);
    expect(AWARDS.every((a) => a.winner === null)).toBe(true);
  });
  it("short name mode shows first name plus family initial", () => {
    expect(displayName("Soha Salman", "short")).toBe("Soha S.");
  });
});

describe("Pixel helper", () => {
  it("answers what a prompt is with the club's exact words", () => {
    expect(answerQuestion("What is a prompt?").text).toBe(
      "A prompt is the instruction we give to an AI. It tells the AI exactly what we want!",
    );
  });
  it("knows the Day 9 answer", () => {
    expect(answerQuestion("What did we do on Day 9?").text).toMatch(/clicked Generate/);
  });
  it("protects phone numbers", () => {
    expect(answerQuestion("my phone is 0300 1234567").kind).toBe("privacy");
  });
  it("admits when it does not know", () => {
    expect(answerQuestion("xyzzy quantum banana").kind).toBe("unknown");
  });
});

describe("Prompt Doctor", () => {
  it("gives 0 stars to 'Make a website.'", () => {
    expect(scorePrompt("Make a website.").stars).toBe(0);
  });
  it("gives 6 stars to a full formula prompt", () => {
    expect(
      scorePrompt("Create a modern website for a math club for students with Home and Gallery pages in blue with buttons").stars,
    ).toBe(6);
  });
});

describe("content from the club notes", () => {
  it("Day 5 teaches the full prompt definition with its example", () => {
    const day5 = DAYS.find((d) => d.n === 5);
    expect(day5?.learn?.[0]?.a).toContain("The instruction or question we give to an AI to tell it what we want it to do.");
    expect(day5?.learn?.[0]?.a).toContain("Write a story about a brave girl.");
  });
  it("Day 2 lists what we drew: name, logo, pictures, buttons, favourite colours", () => {
    const text = DAYS.find((d) => d.n === 2)?.did.join(" ") ?? "";
    for (const w of ["website name", "logo", "pictures", "buttons", "favourite colours"]) expect(text).toContain(w);
  });
  it("a grade number alone doesn't count as a feature", () => {
    expect(scorePrompt("A website for a 4th-grade class").found).not.toContain("features");
    expect(scorePrompt("Write 5 lines about space").found).toContain("features");
  });
});
