"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthlySpend } from "@/lib/demo-data";

export function SpendingChart() {
  return (
    <div className="h-80 rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly spending</p>
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Utilities vs. upgrades</h2>
      </div>
      <ResponsiveContainer width="100%" height="76%">
        <BarChart data={monthlySpend}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.28)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
          <Tooltip cursor={{ fill: "rgba(16, 185, 129, 0.08)" }} />
          <Bar dataKey="utilities" fill="#64748b" radius={[8, 8, 0, 0]} />
          <Bar dataKey="upgrades" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
