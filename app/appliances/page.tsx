import { ApplianceTracker } from "@/components/appliances/appliance-tracker";
import { AppShell } from "@/components/layout/app-shell";

export default function AppliancesPage() {
  return (
    <AppShell>
      <ApplianceTracker />
    </AppShell>
  );
}
