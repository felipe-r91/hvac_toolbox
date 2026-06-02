import {
  type FleetData,
  type HealthCheckDraft,
  type MaintenanceReport,
  type ServiceReportDraft,
} from "../types/maintenance";
import { emptyFleet } from "../data/emptyFleet";

const STORAGE_KEY = "hvac-fleet-data-v3";

type StoredFleetData = Partial<FleetData> & {
};

function normalizeServiceReportDraft(draft: Record<string, unknown>): ServiceReportDraft {
  return {
    ...draft,
    reportCategory: "service_report",
    workPerformed: typeof draft.workPerformed === "string" ? draft.workPerformed : "",
  } as ServiceReportDraft;
}

function normalizeMaintenanceReport(report: Record<string, unknown>): MaintenanceReport {
  return {
    ...report,
    reportCategory: report.reportCategory || "machine_maintenance",
  } as MaintenanceReport;
}

function normalizeHealthCheckDraft(draft: Record<string, unknown>): HealthCheckDraft {
  return {
    ...draft,
    reportCategory: "health_check",
    tasks: Array.isArray(draft.tasks) ? draft.tasks : [],
    taskPhotos: Array.isArray(draft.taskPhotos) ? draft.taskPhotos : [],
  } as HealthCheckDraft;
}

export function loadFleet(): FleetData {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return emptyFleet;

  try {
    const parsed = JSON.parse(raw) as StoredFleetData;
    const storedServiceReportDrafts = Array.isArray(parsed.serviceReportDrafts)
      ? parsed.serviceReportDrafts
      : [];

    return {
      vessels: Array.isArray(parsed.vessels) ? parsed.vessels : [],
      reports: Array.isArray(parsed.reports)
        ? parsed.reports.map((report) =>
            normalizeMaintenanceReport(report as Record<string, unknown>)
          )
        : [],
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      serviceReportDrafts: storedServiceReportDrafts.map((draft) =>
        normalizeServiceReportDraft(draft as Record<string, unknown>)
      ),
      cfrDrafts: Array.isArray(parsed.cfrDrafts) ? parsed.cfrDrafts : [],
      dailyDrafts: Array.isArray(parsed.dailyDrafts) ? parsed.dailyDrafts : [],
      healthCheckDrafts: Array.isArray(parsed.healthCheckDrafts)
        ? parsed.healthCheckDrafts.map((draft) =>
            normalizeHealthCheckDraft(draft as Record<string, unknown>)
          )
        : [],
    };
  } catch {
    return emptyFleet;
  }
}

export function saveFleet(fleet: FleetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
}

export function resetFleet() {
  localStorage.removeItem(STORAGE_KEY);
}
