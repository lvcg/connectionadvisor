const faqs = [
  {
    question: "What is included in the free version?",
    answer: "The free version lets you manage core home profile settings, project planning, basic expenses, vendors, maintenance reminders, and appliance cards using local/demo-friendly workflows.",
  },
  {
    question: "What does DomiVault Plus unlock?",
    answer: "Plus unlocks receipt storage, warranty document storage, maintenance history, Google Calendar sync, vehicle repair records, expiration alerts, and PDF/CSV export reports.",
  },
  {
    question: "How do receipt and warranty scans work?",
    answer: "Use the Scan or Upload controls on expense and appliance records. Free users can preview the workflow; Plus users store files in the document vault and can edit or delete uploaded metadata.",
  },
  {
    question: "Can I track rebates and tax credits?",
    answer: "Yes. Energy-efficiency tax credit sections help organize receipts, product details, install dates, rebate confirmations, utility incentives, and Form 5695 review notes.",
  },
];

export function FAQSection() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">FAQ</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">DomiVault questions and plan details</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Quick answers for storage, premium locks, receipts, warranties, reports, and vehicles.
        </p>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{faq.question}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
