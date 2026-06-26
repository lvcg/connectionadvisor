import type { MaintenanceTask } from "@/types/homey";

function toGoogleDate(date: string, hour = 9) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Date(Date.UTC(year, month - 1, day, hour, 0, 0)).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function createGoogleCalendarMaintenanceUrl(task: MaintenanceTask) {
  const start = toGoogleDate(task.reminderDate || task.dueDate, 9);
  const end = toGoogleDate(task.reminderDate || task.dueDate, 10);
  const details = [
    `Area: ${task.area}`,
    `Cadence: ${task.cadence}`,
    `Due date: ${task.dueDate}`,
    task.reminderDate ? `Reminder date: ${task.reminderDate}` : null,
    task.notes ? `Notes: ${task.notes}` : null,
    "Created from DomiVault.",
  ].filter(Boolean).join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `DomiVault: ${task.title}`,
    dates: `${start}/${end}`,
    details,
    location: task.area,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
