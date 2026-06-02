export type StoredHealthCheckTemplateTask = {
  id: string;
  category: string;
  task: string;
  tool?: string;
  unit?: string | null;
  required?: boolean;
  measurable?: boolean;
  photoRequiredOnFault?: boolean;
  photoRequiredOnAttention?: boolean;
};

export type StoredHealthCheckTemplate = {
  code: string;
  name: string;
  templateType: "HEALTH_CHECK";
  versionId: string;
  versionNumber: number;
  tasks: StoredHealthCheckTemplateTask[];
};

export type StoredHealthCheckTemplateLibrary = {
  templates: StoredHealthCheckTemplate[];
  syncedAt?: string;
};

const STORAGE_KEY = "hvac-health-check-template-library-v1";

export function loadHealthCheckTemplateLibrary(): StoredHealthCheckTemplateLibrary {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { templates: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredHealthCheckTemplateLibrary;

    return {
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
      syncedAt: parsed.syncedAt,
    };
  } catch {
    return { templates: [] };
  }
}

export function saveHealthCheckTemplateLibrary(
  library: StoredHealthCheckTemplateLibrary
) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

export function resetHealthCheckTemplateLibrary() {
  localStorage.removeItem(STORAGE_KEY);
}
