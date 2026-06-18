import { MaintenanceBoard } from "@/components/dashboard/maintenance-board";
import { AppShell } from "@/components/layout/app-shell";

export default function MaintenancePage() {
  return (
    <AppShell>
      <MaintenanceBoard />
    </AppShell>
  );
}
