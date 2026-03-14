import { type MaintenanceTask, type TaskCategory } from "../types/maintenance";

export const categoryOrder: TaskCategory[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Semi-Annual",
  "Annual",
  "2-Year / Shipyard",
  "Startup",
  "Operational",
  "Off-limit Operation",
  "VSD Maintenance",
  "EM Starter",
  "SSS Maintenance",
  "Brine System",
  "Cargo Fans/Dampers",
  "Pneumatic",
  "Sensors",
  "Shutdown/Idle",
  "Fault-finding",
];

export function groupTasks(tasks: MaintenanceTask[], search: string, pendingOnly: boolean) {
  const normalized = search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      !normalized ||
      task.task.toLowerCase().includes(normalized) ||
      task.category.toLowerCase().includes(normalized) ||
      (task.tool || "").toLowerCase().includes(normalized);

    const matchesPending = !pendingOnly || !task.checked;

    return matchesSearch && matchesPending;
  });

  return categoryOrder
    .map((category) => ({
      category,
      tasks: filtered.filter((task) => task.category === category),
    }))
    .filter((section) => section.tasks.length > 0);
}