import { Link } from "react-router-dom";
import {
  type CorrectiveDraft,
  type MaintenanceReport,
  type ReportCategory,
  type Vessel,
} from "../types/maintenance";
import { LuFileText } from "react-icons/lu";

type Props = {
  vessels: Vessel[];
  reports: MaintenanceReport[];
  correctiveDrafts: CorrectiveDraft[];
};

function statusBadge(status: "online" | "down") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : "bg-red-100 text-red-800 ring-red-200";
}

function reportCategoryBadge(category: ReportCategory) {
  switch (category) {
    case "health_check":
      return "bg-blue-100 text-blue-800";
    case "corrective":
      return "bg-yellow-100 text-yellow-800";
    case "cfr":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function reportCategoryLabel(category: ReportCategory) {
  switch (category) {
    case "health_check":
      return "Health Check";
    case "corrective":
      return "Corrective";
    case "cfr":
      return "CFR";
    default:
      return category;
  }
}

type MachineHistoryItem =
  | {
      id: string;
      source: "maintenance_report";
      reportCategory: "health_check";
      date: string;
      status: "online" | "down";
      label: string;
      preventiveReport: MaintenanceReport;
    }
  | {
      id: string;
      source: "corrective_draft";
      reportCategory: "corrective" | "cfr";
      date: string;
      status: "online" | "down";
      label: string;
      correctiveDraft: CorrectiveDraft;
    };

export function ReportsPage({ vessels, reports, correctiveDrafts }: Props) {
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
          const vesselPreventiveReports = reports.filter(
            (report) => report.vesselId === vessel.id
          );

          const vesselCorrectiveDrafts = correctiveDrafts.filter(
            (draft) => draft.vesselId === vessel.id
          );

          const vesselHistoryCount =
            vesselPreventiveReports.length + vesselCorrectiveDrafts.length;

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
                  const machinePreventiveReports = vesselPreventiveReports
                    .filter((report) => report.machineId === plan.machine.id)
                    .map(
                      (report): MachineHistoryItem => ({
                        id: report.id,
                        source: "maintenance_report",
                        reportCategory: "health_check",
                        date: report.completedAt,
                        status: report.overallStatus,
                        label: new Date(report.completedAt).toLocaleString(),
                        preventiveReport: report,
                      })
                    );

                  const machineCorrectiveDrafts = vesselCorrectiveDrafts
                    .filter((draft) => draft.machineId === plan.machine.id)
                    .map(
                      (draft): MachineHistoryItem => ({
                        id: draft.id,
                        source: "corrective_draft",
                        reportCategory: draft.reportCategory,
                        date: draft.createdAt,
                        status:
                          draft.machineReturnedToService === "yes" ? "online" : "down",
                        label: new Date(draft.createdAt).toLocaleString(),
                        correctiveDraft: draft,
                      })
                    );

                  const machineHistory = [
                    ...machinePreventiveReports,
                    ...machineCorrectiveDrafts,
                  ].sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  );

                  const latestItem = machineHistory[0] || null;

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
                              latestItem
                                ? statusBadge(latestItem.status)
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {latestItem ? latestItem.status : "no report"}
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

                            return (
                              <Link
                                key={item.id}
                                to={`/corrective-reports/${item.id}`}
                                className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div>{item.label}</div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {item.correctiveDraft.problemSummary ||
                                        (item.reportCategory === "cfr"
                                          ? "Conditions found report"
                                          : "Corrective report")}
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