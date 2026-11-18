import { describe, expect, it } from "vitest";
import { LEVELS, gradeChallenge, isChallengeOpen, isLevelUnlocked, pathPercent } from "@/lib/learning-data";
import { drawEmoji, sortByEmoji, sortByScore, tierOdds } from "@/lib/luck";
import { cleanChat } from "@/lib/chat-filter";

describe("learning path", () => {
  it("has five levels from Beginner to Professional", () => {
    expect(LEVELS.map((l) => l.name)).toEqual(["Beginner", "Explorer", "Builder", "Pro", "Professional"]);
  });
  it("locks a level until the earlier ones are passed", () => {
    expect(isLevelUnlocked("beginner", [])).toBe(true);
    expect(isLevelUnlocked("builder", ["beginner"])).toBe(false);
    expect(isLevelUnlocked("builder", ["beginner", "explorer"])).toBe(true);
  });
  it("opens the challenge only after every lesson", () => {
    const b = LEVELS[0]!;
    expect(isChallengeOpen(b, ["b1", "b2"])).toBe(false);
    expect(isChallengeOpen(b, ["b1", "b2", "b3"])).toBe(true);
  });
  it("passes at 70% and fails below", () => {
    const b = LEVELS[0]!;
    const right = b.challenge.map((q) => q.answer);
    expect(gradeChallenge(b, right).passed).toBe(true);
    expect(gradeChallenge(b, [right[0]!, right[1]!, -1, -1]).passed).toBe(false);
  });
  it("counts the whole path as 100% when all done", () => {
    expect(pathPercent(LEVELS.flatMap((l) => l.lessons.map((x) => x.id)), LEVELS.map((l) => l.id))).toBe(100);
  });
});

describe("luck and emojis", () => {
  it("more luck gives better legendary odds", () => {
    expect(tierOdds(100).legendary).toBeGreaterThan(tierOdds(0).legendary);
    const o = tierOdds(50);
    expect(o.common + o.rare + o.epic + o.legendary).toBeCloseTo(1);
  });
  it("a very low roll is legendary", () => {
    expect(drawEmoji(0, 0.001, 0).tier).toBe("legendary");
    expect(drawEmoji(0, 0.999, 0).tier).toBe("common");
  });
  it("ranks by score, and emoji board by best emoji", () => {
    const rows = [
      { display_name: "A", score: 10, top_emoji_rank: 4, emoji_count: 1 },
      { display_name: "B", score: 90, top_emoji_rank: 1, emoji_count: 5 },
    ];
    expect(sortByScore(rows)[0]!.display_name).toBe("B");
    expect(sortByEmoji(rows)[0]!.display_name).toBe("A");
  });
});

describe("class chat safety", () => {
  it("blocks unkind words, numbers and links", () => {
    expect(cleanChat("you are stupid").ok).toBe(false);
    expect(cleanChat("call 03001234567").ok).toBe(false);
    expect(cleanChat("see https://x.com").ok).toBe(false);
    expect(cleanChat("Great job on your website!").ok).toBe(true);
  });
});
