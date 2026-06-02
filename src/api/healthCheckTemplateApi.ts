import { API_BASE_URL } from "./config";

export type BackendHealthCheckTemplateTask = {
  id: string;
  category: string;
  task: string;
  tool?: string | null;
  unit?: string | null;
  required?: boolean;
  measurable?: boolean;
  photoRequiredOnFault?: boolean;
  photoRequiredOnAttention?: boolean;
};

export type BackendHealthCheckTemplate = {
  code: string;
  name: string;
  templateType: "HEALTH_CHECK";
  versionId: string;
  versionNumber: number;
  tasks: BackendHealthCheckTemplateTask[];
};

export type BackendHealthCheckTemplateLibraryResponse = {
  templates: BackendHealthCheckTemplate[];
};

export async function getHealthCheckTemplateLibrary(): Promise<BackendHealthCheckTemplateLibraryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/fleet/health-check-template-library`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load health check template library: ${text}`);
  }

  return response.json();
}
