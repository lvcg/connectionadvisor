import { ExpenseTracker } from "@/components/expenses/expense-tracker";
import { AppShell } from "@/components/layout/app-shell";

export default function ExpensesPage() {
  return (
    <AppShell>
      <ExpenseTracker />
    </AppShell>
  );
}
