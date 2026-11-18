import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bot, FileText, Gamepad2, Home, Images, Info, Map, Trophy, Users, ArrowUp, Contact, LogIn, LogOut, ShieldCheck, UserRound, GraduationCap, Medal, Rocket, MessagesSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { canEditContent } from "@/lib/accounts";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CONFIG, FOUNDER, MENTORS, TEACHER } from "@/lib/club-data";
import { FounderBadge } from "@/components/club/Bits";
import { FounderEmblem } from "@/components/club/Art";
import { HelperProvider, useHelper } from "@/components/club/PixelHelper";
import { ModeButtons, ModeSwitcher, PartyLayer } from "@/components/layout/ModeSwitcher";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: Info },
  { to: "/team", label: "Team", icon: Users },
  { to: "/journey", label: "Journey", icon: Map },
  { to: "/roster", label: "Roster", icon: Contact },
  { to: "/photos", label: "Photos", icon: Images },
  { to: "/worksheets", label: "Worksheets", icon: FileText },
  { to: "/playground", label: "Playground", icon: Gamepad2 },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/learn", label: "Learning Path", icon: GraduationCap },
  { to: "/rankings", label: "Rankings", icon: Medal },
  { to: "/projects", label: "Projects", icon: Rocket },
  { to: "/awards", label: "Awards", icon: Trophy },
] as const;

const TOP = ["/journey", "/learn", "/projects", "/games"] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <HelperProvider>
      <Shell>{children}</Shell>
    </HelperProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setDrawer(false), [pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <TopBar drawer={drawer} onBurger={() => setDrawer((d) => !d)} />
      <PartyLayer />

      <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-[250px] flex-col border-r bg-sidebar lg:flex" aria-label="Sidebar">
        <SideNav />
      </aside>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="flex w-[280px] flex-col gap-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Pages of the Math Blog Club website</SheetDescription>
          <div className="flex items-center gap-2 border-b px-5 py-4 font-display text-lg font-bold">
            <span aria-hidden="true">🚀</span> {CONFIG.brand}
          </div>
          <SideNav id="mobile-menu" onNavigate={() => setDrawer(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:ml-[250px]">
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className="absolute inset-x-0 top-0 h-1 bg-transparent" aria-hidden="true">
      <div className="h-full bg-brand transition-[width] duration-150" style={{ width: `${p}%` }} />
    </div>
  );
}

function TopBar({ drawer, onBurger }: { drawer: boolean; onBurger: () => void }) {
  const { setOpen } = useHelper();
  return (
    <header className="glass-bar sticky top-0 z-40 h-16 border-b">
      <ScrollProgress />
      <div className="flex h-full items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onBurger}
          aria-expanded={drawer}
          aria-controls="mobile-menu"
          aria-label={drawer ? "Close menu" : "Open menu"}
          className="burger flex h-11 w-11 flex-col items-center justify-center rounded-xl text-foreground hover:bg-muted lg:hidden"
        >
          <span />
          <span />
          <span />
        </button>
        <Link to="/" className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold text-foreground sm:text-xl">
          <span aria-hidden="true" className="text-2xl">
            🚀
          </span>
          <span className="max-[440px]:sr-only">{CONFIG.brand}</span>
        </Link>
        <span className="hidden h-6 w-px bg-border md:block" aria-hidden="true" />
        <span className="hidden text-sm font-semibold text-muted-foreground md:block">Aga Khan School · 4C</span>

        <nav aria-label="Quick links" className="ml-auto hidden items-center gap-6 xl:flex">
          {TOP.map((to) => {
            const item = NAV.find((n) => n.to === to)!;
            return (
              <Link key={to} to={to} className="nav-underline whitespace-nowrap text-[0.95rem] font-semibold text-foreground">
                {item.label}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(true)} className="nav-underline whitespace-nowrap text-[0.95rem] font-semibold text-foreground">
            Helper
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-4">
          <Link to="/team" aria-label="Meet founder Salman" className="hidden sm:block">
            <FounderBadge compact />
          </Link>
          <Link to="/team" aria-label="Meet founder Salman" className="founder-ring grid h-11 w-11 place-items-center rounded-full bg-card sm:hidden">
            <FounderEmblem className="h-7 w-7" />
          </Link>
          <ModeSwitcher />
          <AccountButton />
        </div>
      </div>
    </header>
  );
}

function AccountButton() {
  const auth = useAuth();
  if (!auth.ready || !auth.userId) {
    return (
      <Link
        to="/auth"
        search={{ redirect: undefined }}
        className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 sm:px-4"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
      </Link>
    );
  }
  const staff = canEditContent(auth.roles);
  const parts = auth.profile?.display_name.split(" ") ?? ["Me"];
  const first = (/^(miss|mr|mrs|ms)\.?$/i.test(parts[0] ?? "") ? parts.slice(0, 2).join(" ") : parts[0]) || "Me";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary bg-card px-3 text-sm font-bold text-foreground transition hover:bg-muted">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-display text-primary-foreground" aria-hidden="true">
          {first[0]}
        </span>
        <span className="max-w-24 truncate max-[440px]:sr-only">{first}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{auth.profile?.display_name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {staff && (
          <DropdownMenuItem asChild>
            <Link to="/teacher">
              <ShieldCheck className="h-4 w-4" /> Teacher page
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/me">
            <UserRound className="h-4 w-4" /> My page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void auth.signOut()}>
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SideNav({ onNavigate, id }: { onNavigate?: () => void; id?: string }) {
  const { setOpen } = useHelper();
  const auth = useAuth();
  const staff = canEditContent(auth.roles);
  const memberLinks = auth.userId
    ? [
        ...(staff ? [{ to: "/teacher" as const, label: "Teacher page", icon: ShieldCheck }] : []),
        { to: "/me" as const, label: "My page", icon: UserRound },
        { to: "/chat" as const, label: "Class chat", icon: MessagesSquare },
      ]
    : [{ to: "/auth" as const, label: "Sign in", icon: LogIn }];
  return (
    <nav id={id} aria-label="Main" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              activeOptions={{ exact: to === "/" }}
              className="group flex min-h-11 items-center gap-3 rounded-xl border-l-4 border-transparent px-3 py-2 font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:border-primary data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              setOpen(true);
            }}
            className="group flex min-h-11 w-full items-center gap-3 rounded-xl border-l-4 border-transparent px-3 py-2 font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Bot className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
            Helper
            <span className="ml-auto rounded-full bg-fun-green-soft px-2 py-0.5 text-xs font-bold text-fun-green-ink">Pixel</span>
          </button>
        </li>
      </ul>
      <p className="mb-1 mt-5 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Club members</p>
      <ul className="space-y-1">
        {memberLinks.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              className="group flex min-h-11 items-center gap-3 rounded-xl border-l-4 border-transparent px-3 py-2 font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:border-primary data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <Icon className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
        {auth.userId && (
          <li>
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                void auth.signOut();
              }}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl border-l-4 border-transparent px-3 py-2 font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
            </button>
          </li>
        )}
      </ul>
      <p className="mb-2 mt-5 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Site look</p>
      <div className="mb-4 px-1"><ModeButtons /></div>
      <div className="mt-auto rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-sm">
        <p className="font-semibold text-foreground">
          {CONFIG.brand} · {CONFIG.year.replace(/\s/g, "")}
        </p>
        <p className="mt-1">Made with ❤️ by Salman</p>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-footer pb-[env(safe-area-inset-bottom)] text-footer-foreground">
      <div className="grid gap-10 px-6 py-12 sm:px-10 md:grid-cols-3">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Club Info</h2>
          <ul className="space-y-1 text-footer-muted">
            <li>{CONFIG.school}</li>
            <li>{CONFIG.city}</li>
            <li>
              {CONFIG.classLabel} ({CONFIG.classCode})
            </li>
            <li>Academic year {CONFIG.year}</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Team Credits</h2>
          <ul className="space-y-1 text-footer-muted">
            <li className="flex items-center gap-2">
              <FounderEmblem className="h-5 w-5" /> Founder: {FOUNDER.short}
            </li>
            <li>Mentors: {MENTORS.map((m) => m.name).join(", ")}</li>
            <li>Facilitator: {TEACHER.name}</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Club ID</h2>
          <p className="text-footer-muted">
            {CONFIG.brand}
            <br />
            {CONFIG.subtitle}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0 })}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-footer-muted/40 px-4 font-semibold transition hover:bg-footer-foreground/10"
          >
            <ArrowUp className="h-4 w-4" /> Back to top
          </button>
        </div>
      </div>
      <div className="border-t border-footer-muted/20 px-6 py-5 text-center text-sm text-footer-muted sm:px-10">
        <p>Built with curiosity, paper, and prompts. © 2026.</p>
        <p className={cn("mt-1")}>
          This is a school project. Visitors' data is not collected. Explorers sign in by picking their name and making a username — no email, no password.
        </p>
      </div>
    </footer>
  );
}
