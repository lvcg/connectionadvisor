import Link from "next/link";
import { CalendarCheck, Gauge, Home, LogIn, Refrigerator, ReceiptText, Settings, ShieldCheck, UsersRound } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Expenses", href: "/expenses", icon: ReceiptText },
  { label: "Maintenance", href: "/maintenance", icon: CalendarCheck },
  { label: "Appliances", href: "/appliances", icon: Refrigerator },
  { label: "Vendors", href: "/vendors", icon: UsersRound },
  { label: "Login / Signup", href: "/login", icon: LogIn },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Home className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">Homey</span>
              <span className="text-xs text-white/60 dark:text-slate-500">Home intelligence</span>
            </span>
          </Link>

          <nav className="mt-6 grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-950 hover:text-white dark:text-slate-300 dark:hover:bg-white dark:hover:text-slate-950"
              >
                <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-emerald-200/80 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="font-semibold">Private by design</p>
            <p className="mt-1 leading-6 opacity-80">Supabase RLS keeps every home, project, bill, and receipt scoped to its owner.</p>
          </div>
        </aside>

        <main className="min-w-0 rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Home command center</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Know what your home costs, needs, and earns back.</h1>
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-slate-950">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
