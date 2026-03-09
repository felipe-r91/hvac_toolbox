import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { downloadJsonFile } from "../utils/downloadJson";
import { type MaintenanceReport } from "../types/maintenance";

type Props = {
  reports: MaintenanceReport[];
};

export function ReportDetailPage({ reports }: Props) {
  const { reportId } = useParams();

  const report = useMemo(
    () => reports.find((item) => item.id === reportId),
    [reports, reportId]
  );

  if (!report) {
    return <div className="p-6">Report not found.</div>;
  }

  return (
    <section className="space-y-4">
      <BackButton />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">
          {report.machineTag} report
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {report.vesselName} · {report.machineModel} · {report.machineType}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Completed at: {new Date(report.completedAt).toLocaleString()}
        </p>

        <p className="mt-2 text-sm font-medium text-slate-700">
          Overall status: {report.overallStatus}
        </p>

        {report.overallStatus === "down" && report.downtimeReason ? (
          <p className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            Reason: {report.downtimeReason}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Task summary</h2>

        <div className="mt-4 space-y-3">
          {report.tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {task.task}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {task.category} · {task.tool || "—"}
                  </p>
                </div>

                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-800">
                  {task.status}
                </span>
              </div>

              {task.notes ? (
                <p className="mt-2 text-sm text-slate-600">{task.notes}</p>
              ) : null}

              {task.measuredValue ? (
                <p className="mt-1 text-sm text-slate-600">
                  Measured value: {task.measuredValue} {task.unit || ""}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => downloadJsonFile(report, `${report.machineTag}-report.json`)}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        Export report JSON
      </button>
    </section>
  );
}