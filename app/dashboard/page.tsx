import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
