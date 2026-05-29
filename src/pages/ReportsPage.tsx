import { Link } from "react-router-dom";
import {
  type CfrDraft,
  type ServiceReportDraft,
  type DailyDraft,
  type MaintenanceReport,
  type ReportCategory,
  type Vessel,
} from "../types/maintenance";
import { LuFileText } from "react-icons/lu";

type Props = {
  vessels: Vessel[];
  reports: MaintenanceReport[];
  serviceReportDrafts: ServiceReportDraft[];
  cfrDrafts: CfrDraft[];
  dailyDrafts: DailyDraft[];
};

function statusBadge(status: "online" | "down") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : "bg-red-100 text-red-800 ring-red-200";
}

function reportCategoryBadge(category: ReportCategory) {
  switch (category) {
    case "machine_maintenance":
      return "bg-blue-100 text-blue-800";
    case "service_report":
      return "bg-yellow-100 text-yellow-800";
    case "cfr":
      return "bg-purple-100 text-purple-800";
    case "daily":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function reportCategoryLabel(category: ReportCategory) {
  switch (category) {
    case "machine_maintenance":
      return "Machine Maintenance";
    case "service_report":
      return "Service Report";
    case "cfr":
      return "CFR";
    case "daily":
      return "Daily";
    default:
      return category;
  }
}

type MachineHistoryItem =
  | {
      id: string;
      source: "maintenance_report";
      reportCategory: "machine_maintenance";
      date: string;
      status?: "online" | "down";
      label: string;
      maintenanceReport: MaintenanceReport;
    }
  | {
      id: string;
      source: "service_report_draft";
      reportCategory: "service_report";
      date: string;
      status: "online" | "down";
      label: string;
      serviceReportDraft: ServiceReportDraft;
    }
  | {
      id: string;
      source: "cfr_draft";
      reportCategory: "cfr";
      date: string;
      status: "online" | "down";
      label: string;
      cfrDraft: CfrDraft;
    }
  | {
      id: string;
      source: "daily_draft";
      reportCategory: "daily";
      date: string;
      status: "online" | "down";
      label: string;
      dailyDraft: DailyDraft;
    };

export function ReportsPage({
  vessels,
  reports,
  serviceReportDrafts,
  cfrDrafts,
  dailyDrafts,
}: Props) {
  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <LuFileText size={32} className="mt-2 text-slate-500" />
        </div>

        <p className="mt-1 text-sm text-slate-500">Maintenance history</p>
      </section>

      <section className="space-y-4">
        {vessels.map((vessel) => {
          const vesselMaintenanceReports = reports.filter(
            (report) => report.vesselId === vessel.id
          );

          const vesselServiceReportDrafts = serviceReportDrafts.filter(
            (draft) => draft.vesselId === vessel.id
          );

          const vesselCfrDrafts = cfrDrafts.filter(
            (draft) => draft.vesselId === vessel.id
          );

          const vesselDailyDrafts = dailyDrafts.filter(
            (draft) => draft.vesselId === vessel.id
          );

          const vesselHistoryCount =
            vesselMaintenanceReports.length +
            vesselServiceReportDrafts.length +
            vesselCfrDrafts.length +
            vesselDailyDrafts.length;

          return (
            <details
              key={vessel.id}
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {vessel.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      IMO: {vessel.imoNumber || "—"}
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {vesselHistoryCount} reports
                  </div>
                </div>
              </summary>

              <div className="mt-4 space-y-3">
                {vessel.machines.map((plan) => {
                  const machineMaintenanceReports = vesselMaintenanceReports
                    .filter((report) => report.machineId === plan.machine.id)
                    .map(
                      (report): MachineHistoryItem => ({
                        id: report.id,
                        source: "maintenance_report",
                        reportCategory: "machine_maintenance",
                        date: report.completedAt,
                        label: new Date(report.completedAt).toLocaleString(),
                        maintenanceReport: report,
                      })
                    );

                  const machineServiceReportDrafts = vesselServiceReportDrafts
                    .filter((draft) => draft.machineId === plan.machine.id)
                    .map(
                      (draft): MachineHistoryItem => ({
                        id: draft.id,
                        source: "service_report_draft",
                        reportCategory: "service_report",
                        date: draft.createdAt,
                        status:
                          draft.machineReturnedToService === "yes" ? "online" : "down",
                        label: new Date(draft.createdAt).toLocaleString(),
                        serviceReportDraft: draft,
                      })
                    );

                  const machineCfrDrafts = vesselCfrDrafts
                    .filter((draft) => draft.machineId === plan.machine.id)
                    .map(
                      (draft): MachineHistoryItem => ({
                        id: draft.id,
                        source: "cfr_draft",
                        reportCategory: "cfr",
                        date: draft.createdAt,
                        status: draft.machineStatus,
                        label: new Date(draft.createdAt).toLocaleString(),
                        cfrDraft: draft,
                      })
                    );

                  const machineDailyDrafts = vesselDailyDrafts
                    .filter((draft) => draft.machineId === plan.machine.id)
                    .map(
                      (draft): MachineHistoryItem => ({
                        id: draft.id,
                        source: "daily_draft",
                        reportCategory: "daily",
                        date: draft.createdAt,
                        status: draft.alarmPresent ? "down" : "online",
                        label: new Date(draft.createdAt).toLocaleString(),
                        dailyDraft: draft,
                      })
                    );

                  const machineHistory = [
                    ...machineMaintenanceReports,
                    ...machineServiceReportDrafts,
                    ...machineCfrDrafts,
                    ...machineDailyDrafts,
                  ].sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  );

                  const latestItem = machineHistory[0] || null;
                  const latestStatus = latestItem?.status;

                  return (
                    <details
                      key={plan.machine.id}
                      className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200"
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {plan.machine.tag}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {plan.machine.location}
                            </p>
                            <p className="text-sm text-slate-500">
                              {plan.machine.model} · {plan.machine.starterType} ·{" "}
                              {plan.machine.type}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                              latestStatus
                                ? statusBadge(latestStatus)
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {latestStatus || (latestItem ? "report" : "no report")}
                          </span>
                        </div>
                      </summary>

                      <div className="mt-4 space-y-2">
                        {machineHistory.length > 0 ? (
                          machineHistory.map((item) => {
                            if (item.source === "maintenance_report") {
                              return (
                                <Link
                                  key={item.id}
                                  to={`/reports/${item.id}`}
                                  className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span>{item.label}</span>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportCategoryBadge(
                                        item.reportCategory
                                      )}`}
                                    >
                                      {reportCategoryLabel(item.reportCategory)}
                                    </span>
                                  </div>
                                </Link>
                              );
                            }

                            if (item.source === "service_report_draft") {
                              return (
                                <Link
                                  key={item.id}
                                  to={`/service-reports/${item.id}`}
                                  className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div>{item.label}</div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        {item.serviceReportDraft.workPerformed ||
                                          "Service report"}
                                      </div>
                                    </div>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportCategoryBadge(
                                        item.reportCategory
                                      )}`}
                                    >
                                      {reportCategoryLabel(item.reportCategory)}
                                    </span>
                                  </div>
                                </Link>
                              );
                            }

                            if (item.source === "daily_draft") {
                              return (
                                <Link
                                  key={item.id}
                                  to={`/daily-reports/${item.id}`}
                                  className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div>{item.label}</div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        {item.dailyDraft.workConductedToday ||
                                          "Daily report"}
                                      </div>
                                    </div>

                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportCategoryBadge(
                                        item.reportCategory
                                      )}`}
                                    >
                                      {reportCategoryLabel(item.reportCategory)}
                                    </span>
                                  </div>
                                </Link>
                              );
                            }

                            return (
                              <Link
                                key={item.id}
                                to={`/cfr-reports/${item.id}`}
                                className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div>{item.label}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {item.cfrDraft.conditionFound ||
                                        "Conditions found report"}
                                    </div>
                                  </div>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${reportCategoryBadge(
                                      item.reportCategory
                                    )}`}
                                  >
                                    {reportCategoryLabel(item.reportCategory)}
                                  </span>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
                            No reports for this machine yet
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </section>
    </section>
  );
}
