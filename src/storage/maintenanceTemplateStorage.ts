import type { MaintenanceTask } from "../types/maintenance";

export type StoredMaintenanceTemplateTask = {
  id: string;
  category: MaintenanceTask["category"];
  task: string;
  tool?: string;
  unit?: string;
  required?: boolean;
  measurable?: boolean;
  photoRequiredOnFault?: boolean;
  photoRequiredOnAttention?: boolean;
};

export type StoredMaintenanceTemplate = {
  code: string;
  name: string;
  templateType: "MACHINE" | "STARTER";
  versionId: string;
  versionNumber: number;
  tasks: StoredMaintenanceTemplateTask[];
};

export type StoredMaintenanceTemplateLibrary = {
  templates: StoredMaintenanceTemplate[];
  syncedAt?: string;
};

const STORAGE_KEY = "hvac-maintenance-template-library-v1";

export function loadMaintenanceTemplateLibrary(): StoredMaintenanceTemplateLibrary {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { templates: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredMaintenanceTemplateLibrary;

    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      syncedAt: parsed.syncedAt,
    };
  } catch {
    return { templates: [] };
  }
}

export function saveMaintenanceTemplateLibrary(
  library: StoredMaintenanceTemplateLibrary
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

export function resetMaintenanceTemplateLibrary() {
  localStorage.removeItem(STORAGE_KEY);
}