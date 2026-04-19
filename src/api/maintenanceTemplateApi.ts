import { API_BASE_URL } from "./config";
import type { MaintenanceTask } from "../types/maintenance";

export type BackendMaintenanceTemplateTask = {
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

export type BackendMaintenanceTemplate = {
  code: string;
  name: string;
  templateType: "MACHINE" | "STARTER";
  versionId: string;
  versionNumber: number;
  tasks: BackendMaintenanceTemplateTask[];
};

export type BackendMaintenanceTemplateLibraryResponse = {
  templates: BackendMaintenanceTemplate[];
};

export async function getMaintenanceTemplateLibrary(): Promise<BackendMaintenanceTemplateLibraryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/template-library`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load maintenance template library: ${text}`);
  }

  return response.json();
}