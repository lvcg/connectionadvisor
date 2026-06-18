import { AppShell } from "@/components/layout/app-shell";
import { VehicleRepairTracker } from "@/components/vehicles/vehicle-repair-tracker";

export default function VehiclesPage() {
  return (
    <AppShell>
      <VehicleRepairTracker />
    </AppShell>
  );
}
