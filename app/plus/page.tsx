import Link from "next/link";
import { BellRing, CalendarCheck, Car, FileScan, FileText, LifeBuoy, Refrigerator, ShieldCheck } from "lucide-react";
import { RevenueCatUpgradeButton } from "@/components/billing/revenuecat-upgrade-button";

const plusFeatures = [
  {
    title: "Receipt and warranty vault",
    description: "Store receipts, warranty files, serial label photos, and repair documents in one secure place.",
    icon: FileText,
  },
  {
    title: "Appliance warranty expiration alerts",
    description: "Track warranty dates and replacement windows before coverage quietly expires.",
    icon: Refrigerator,
  },
  {
    title: "Vehicle maintenance records",
    description: "Keep car service dates, repair notes, warranty records, and exportable vehicle history together.",
    icon: Car,
  },
  {
    title: "Google Calendar sync",
    description: "Prepare maintenance reminders for Google Calendar now, with automatic sync planned for Plus.",
    icon: CalendarCheck,
  },
  {
    title: "OCR scan extraction",
    description: "Scan receipts and warranty images, extract text, and save the searchable record to the vault.",
    icon: FileScan,
  },
  {
    title: "Emergency vendor/contact list",
    description: "Keep preferred plumbers, electricians, HVAC techs, contractors, and emergency contacts ready.",
    icon: LifeBuoy,
  },
  {
    title: "Renewal reminders",
    description: "Stay ahead of insurance, utilities, filters, warranties, registrations, and recurring upkeep.",
    icon: BellRing,
  },
  {
    title: "Export-ready home records",
    description: "Create PDF and CSV packets for taxes, resale prep, insurance claims, and contractor handoffs.",
    icon: ShieldCheck,
  },
];

export default function PlusPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">DomiVault</Link>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white">Dashboard</Link>
            <Link href="/settings#plan" className="hover:text-slate-950 dark:hover:text-white">Plan</Link>
            <Link href="/faq" className="hover:text-slate-950 dark:hover:text-white">FAQ</Link>
          </div>
        </nav>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">DomiVault Plus</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Keep the records you will need before you need them.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500 dark:text-slate-400">
            DomiVault helps homeowners keep receipts, warranties, maintenance records, and repair history organized before they need them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <RevenueCatUpgradeButton className="h-12 rounded-2xl px-5" />
            <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
              Continue with Free
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {plusFeatures.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.05]">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <feature.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          Plus access is verified by billing state in your profile. The browser can show upgrade buttons, but server routes and Supabase policies decide which paid records can be created or exported.
        </section>
      </div>
    </main>
  );
}
