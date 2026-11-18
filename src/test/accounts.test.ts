import { describe, expect, it } from "vitest";
import { can, canEditContent, isValidPassword, isValidUsername, mainRole, normalizeUsername, SIGN_IN_HOW } from "@/lib/accounts";
import { isMode, MODES } from "@/lib/modes";
import { mergeDays, mergeWinners } from "@/lib/club-merge";
import { AWARDS, DAYS } from "@/lib/club-data";

describe("how each person signs in", () => {
  it("explorers pick their name and make a username, with no password", () => {
    expect(SIGN_IN_HOW.student).toMatch(/pick your name/i);
    expect(SIGN_IN_HOW.student).toMatch(/no password/i);
  });
  it("mentors, the teacher and the admin all need a password", () => {
    expect(SIGN_IN_HOW.mentor).toMatch(/password/i);
    expect(SIGN_IN_HOW.teacher).toMatch(/password/i);
    expect(SIGN_IN_HOW.admin).toMatch(/password/i);
  });
  it("cleans up usernames", () => {
    expect(normalizeUsername("Star Coder")).toBe("star.coder");
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("star.coder")).toBe(true);
  });
  it("new staff passwords need at least 6 characters", () => {
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("123456")).toBe(true);
  });
});

describe("who can do what", () => {
  it("explorers only get their own notebook, not the teacher page", () => {
    expect(can(["student"], "ownNotebook")).toBe(true);
    expect(canEditContent(["student"])).toBe(false);
    expect(can(["student"], "editDayNotes")).toBe(false);
  });
  it("mentors can add day notes and photos, but not awards, roster or sign-ins", () => {
    expect(can(["mentor"], "editDayNotes")).toBe(true);
    expect(can(["mentor"], "editPhotos")).toBe(true);
    expect(can(["mentor"], "editAwards")).toBe(false);
    expect(can(["mentor"], "editRoster")).toBe(false);
    expect(can(["mentor"], "freeNames")).toBe(false);
  });
  it("the teacher picks winners, edits the roster and frees names, but can't change passwords", () => {
    expect(can(["teacher"], "editAwards")).toBe(true);
    expect(can(["teacher"], "editRoster")).toBe(true);
    expect(can(["teacher"], "freeNames")).toBe(true);
    expect(can(["teacher"], "resetUsernames")).toBe(false);
    expect(can(["teacher"], "changePasswords")).toBe(false);
  });
  it("only the admin resets usernames, changes passwords and frees every name at once", () => {
    expect(can(["admin"], "resetUsernames")).toBe(true);
    expect(can(["admin"], "changePasswords")).toBe(true);
    expect(can(["admin"], "freeAllNames")).toBe(true);
    expect(can(["teacher"], "freeAllNames")).toBe(false);
  });
  it("the biggest role is shown when someone has more than one", () => {
    expect(mainRole(["mentor", "admin"])).toBe("admin");
    expect(mainRole(["student"])).toBe("student");
  });
});

describe("site looks", () => {
  it("has exactly Day, Night, Party and Study modes", () => {
    expect(MODES.map((m) => m.id)).toEqual(["day", "night", "party", "study"]);
    expect(isMode("party")).toBe(true);
    expect(isMode("dark")).toBe(false);
  });
});

describe("teacher updates", () => {
  it("Day 6 stays a placeholder until the teacher adds notes", () => {
    expect(mergeDays(DAYS, []).find((d) => d.n === 6)?.placeholder).toBe(true);
    const day6 = mergeDays(DAYS, [{ day: 6, title: "Pit-stop day", notes: "We fixed our paper blueprints\nWe shared ideas" }]).find((d) => d.n === 6);
    expect(day6?.placeholder).toBe(false);
    expect(day6?.did).toEqual(["We fixed our paper blueprints", "We shared ideas"]);
  });
  it("award winners show only when the teacher enters them", () => {
    expect(mergeWinners(AWARDS, []).every((a) => a.winner === null)).toBe(true);
    const merged = mergeWinners(AWARDS, [{ award: "Best Teamwork", winner: "Team Rocket" }]);
    expect(merged.find((a) => a.title === "Best Teamwork")?.winner).toBe("Team Rocket");
    expect(merged.find((a) => a.title === "Best Presentation")?.winner).toBeNull();
  });
});
