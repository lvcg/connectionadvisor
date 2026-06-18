import { AppShell } from "@/components/layout/app-shell";
import { ProjectPlanner } from "@/components/projects/project-planner";

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectPlanner />
    </AppShell>
  );
}
