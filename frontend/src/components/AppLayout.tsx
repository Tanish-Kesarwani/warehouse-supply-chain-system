import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";
import { Button, Card } from "./ui";
import { cn } from "../lib/utils";

const links = [
  { to: "/", label: "Command" },
  { to: "/masters", label: "Masters" },
  { to: "/inventory", label: "Inventory Ops" },
  { to: "/procurement", label: "Procurement" },
  { to: "/monitoring", label: "Monitoring" },
  { to: "/reports", label: "Reports" }
];

function LogoMark() {
  return (
    <svg viewBox="0 0 240 120" className="h-12 w-28">
      <defs>
        <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9d2e" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="12" y="24" width="216" height="72" rx="18" fill="rgba(255,255,255,0.05)" />
      <path d="M34 82 L66 40 L96 82" stroke="url(#beam)" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M110 82 L142 40 L172 82" stroke="rgba(255,255,255,0.82)" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M182 82 L204 54 L224 82" stroke="rgba(255,255,255,0.4)" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function AppLayout() {
  const { username, logout } = useAuth();

  return (
    <div className="min-h-screen bg-hero-grid bg-hero-grid">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-black/20 px-5 py-6 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <div>
              <LogoMark />
              <p className="mt-4 text-xs uppercase tracking-[0.35em] text-ember/80">Warehouse Command</p>
              <h1 className="mt-2 font-display text-2xl text-white">Supply Chain Operations</h1>
              <p className="mt-2 text-sm text-slate-400">
                Industrial-grade oversight for stock, procurement, and reporting.
              </p>
            </div>

            <nav className="grid gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive ? "bg-ember text-ink" : "bg-white/5 text-slate-200 hover:bg-white/10"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <Card className="space-y-3 bg-gradient-to-br from-white/[0.08] to-white/[0.03]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
              <p className="text-lg font-semibold text-white">{username}</p>
              <p className="text-sm text-slate-400">Mock JWT shell active. Backend remains untouched.</p>
              <Button tone="muted" onClick={logout}>
                Sign out
              </Button>
            </Card>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
