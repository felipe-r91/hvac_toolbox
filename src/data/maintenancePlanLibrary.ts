import type { MaintenanceTask } from "../types/maintenance";
import { loadMaintenanceTemplateLibrary } from "../storage/maintenanceTemplateStorage";

export function getAvailableMachineModels(): string[] {
  const library = loadMaintenanceTemplateLibrary();

  return library.templates
    .filter((template) => template.templateType === "MACHINE")
    .map((template) => template.code)
    .sort();
}

export function getAvailableStarterModels(): string[] {
  const library = loadMaintenanceTemplateLibrary();

  return library.templates
    .filter((template) => template.templateType === "STARTER")
    .map((template) => template.code)
    .sort();
}

export function createTasksFromModel(
  model: string,
  starter: string
): MaintenanceTask[] {
  const library = loadMaintenanceTemplateLibrary();

  const machineTemplate = library.templates.find(
    (template) => template.templateType === "MACHINE" && template.code === model
  );

  const starterTemplate = library.templates.find(
    (template) => template.templateType === "STARTER" && template.code === starter
  );

  if (!machineTemplate || !starterTemplate) {
    return [];
  }

  return [...machineTemplate.tasks, ...starterTemplate.tasks].map((item) => ({
    id: item.id,
    category: item.category,
    task: item.task,
    tool: item.tool || "",
    checked: false,
    status: "pending",
    notes: "",
    measuredValue: "",
    unit: item.unit,
    completedAt: undefined,
    photoIds: [],
  }));
}