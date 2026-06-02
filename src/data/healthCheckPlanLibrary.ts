import { loadHealthCheckTemplateLibrary } from "../storage/healthCheckTemplateStorage";
import { type MaintenanceTask } from "../types/maintenance";

export function createHealthCheckTasks(): MaintenanceTask[] {
  const library = loadHealthCheckTemplateLibrary();
  const template =
    library.templates.find((item) => item.templateType === "HEALTH_CHECK") ||
    library.templates[0];

  if (!template) {
    return [];
  }

  return template.tasks.map((item) => ({
    id: item.id,
    category: item.category,
    task: item.task,
    tool: item.tool || "",
    checked: false,
    status: "pending",
    notes: "",
    measuredValue: "",
    unit: item.unit || undefined,
    completedAt: undefined,
    photoIds: [],
  }));
}

export function getHealthCheckTemplateMeta() {
  const library = loadHealthCheckTemplateLibrary();
  const template =
    library.templates.find((item) => item.templateType === "HEALTH_CHECK") ||
    library.templates[0];

  if (!template) return null;

  return {
    code: template.code,
    name: template.name,
    versionId: template.versionId,
    versionNumber: template.versionNumber,
  };
}
