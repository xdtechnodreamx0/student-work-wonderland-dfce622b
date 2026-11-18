// Account rules shared by the browser and the server. No network calls here.

export type ClubRole = "admin" | "teacher" | "mentor" | "student";

export const ROLE_LABEL: Record<ClubRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  mentor: "Mentor",
  student: "Explorer",
};

export const ROLE_EMOJI: Record<ClubRole, string> = {
  admin: "🛡️",
  teacher: "🍎",
  mentor: "🧑‍🏫",
  student: "🧒",
};

/** How each kind of person signs in. */
export const SIGN_IN_HOW: Record<ClubRole, string> = {
  student: "Pick your name, then type your username. No password needed.",
  mentor: "Pick your name, then type the mentor password.",
  teacher: "Pick your name, then type the teacher password.",
  admin: "Pick Admin, then type the admin password.",
};

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
}

export function isValidUsername(raw: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,23}$/.test(normalizeUsername(raw));
}

export const MIN_PASSWORD = 5;

export function isValidPassword(pw: string): boolean {
  return pw.length >= MIN_PASSWORD && pw.length <= 72;
}

/** What each role is allowed to do. Bigger roles can do everything smaller ones can. */
export const POWERS = {
  ownNotebook: ["student", "mentor", "teacher", "admin"],
  teacherPage: ["mentor", "teacher", "admin"],
  editDayNotes: ["mentor", "teacher", "admin"],
  editPhotos: ["mentor", "teacher", "admin"],
  seeNotebooks: ["mentor", "teacher", "admin"],
  seePlanning: ["mentor", "teacher", "admin"],
  editAwards: ["teacher", "admin"],
  editRoster: ["teacher", "admin"],
  seeSignIns: ["teacher", "admin"],
  freeNames: ["teacher", "admin"],
  resetUsernames: ["admin"],
  changePasswords: ["admin"],
  addProjects: ["student", "mentor", "teacher", "admin"],
  editProjects: ["mentor", "teacher", "admin"],
  deleteProjects: ["admin"],
  freeAllNames: ["admin"],
} as const satisfies Record<string, readonly ClubRole[]>;

export type Power = keyof typeof POWERS;

export function can(roles: readonly ClubRole[], power: Power): boolean {
  return roles.some((r) => (POWERS[power] as readonly ClubRole[]).includes(r));
}

/** Teacher, mentors and admin can edit club content and open the teacher page. */
export function canEditContent(roles: readonly ClubRole[]): boolean {
  return can(roles, "teacherPage");
}

export function mainRole(roles: readonly ClubRole[]): ClubRole | null {
  for (const r of ["admin", "teacher", "mentor", "student"] as const) if (roles.includes(r)) return r;
  return null;
}

export const NAME_TAKEN_MESSAGE = "This name is already signed in. If it's you, ask your teacher to free your name.";
