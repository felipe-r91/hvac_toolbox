import { Link } from "react-router-dom";
import { type MaintenanceReport, type Vessel } from "../types/maintenance";
import { LuFileText } from "react-icons/lu";

type Props = {
  vessels: Vessel[];
  reports: MaintenanceReport[];
};

function statusBadge(status: "online" | "down") {
  return status === "online"
    ? "bg-green-100 text-green-800 ring-green-200"
    : "bg-red-100 text-red-800 ring-red-200";
}

export function ReportsPage({ vessels, reports }: Props) {
  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
            <LuFileText size={32} className="mt-2 text-slate-500" />
        </div>
        
        <p className="mt-1 text-sm text-slate-500">
          Maintenance history
        </p>
      </section>

      <section className="space-y-4">
        {vessels.map((vessel) => {
          const vesselReports = reports.filter((report) => report.vesselId === vessel.id);

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
                    {vesselReports.length} reports
                  </div>
                </div>
              </summary>

              <div className="mt-4 space-y-3">
                {vessel.machines.map((plan) => {
                  const machineReports = vesselReports
                    .filter((report) => report.machineId === plan.machine.id)
                    .sort(
                      (a, b) =>
                        new Date(b.completedAt).getTime() -
                        new Date(a.completedAt).getTime()
                    );

                  const latestReport = machineReports[0] || null;

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
                              {plan.machine.model} · {plan.machine.type}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                              latestReport
                                ? statusBadge(latestReport.overallStatus)
                                : "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                          >
                            {latestReport ? latestReport.overallStatus : "no report"}
                          </span>
                        </div>
                      </summary>

                      <div className="mt-4 space-y-2">
                        {machineReports.length > 0 ? (
                          machineReports.map((report) => (
                            <Link
                              key={report.id}
                              to={`/reports/${report.id}`}
                              className="block rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300"
                            >
                              {new Date(report.completedAt).toLocaleString()}
                            </Link>
                          ))
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