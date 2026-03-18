import { type CorrectiveDraft, type MaintenanceReport } from "../types/maintenance";
import { usePwaUpdater } from "../hooks/usePwaUpdater";

type Props = {
  reports: MaintenanceReport[];
  correctiveDrafts: CorrectiveDraft[];
  onSyncAll: () => void;
  onSyncReport: (reportId: string) => void;
  onSyncCorrectiveDraft: (draftId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onDeleteCorrectiveDraft: (draftId: string) => void;
};

export function SyncPage({
  reports,
  correctiveDrafts,
  onSyncAll,
  onSyncReport,
  onSyncCorrectiveDraft,
  onDeleteReport,
  onDeleteCorrectiveDraft,
}: Props) {
  const { needRefresh, updateApp } = usePwaUpdater();

  const pendingReports = reports.filter((report) => !report.synced);
  const pendingCorrectiveDrafts = correctiveDrafts.filter((draft) => !draft.synced);

  const totalPending = pendingReports.length + pendingCorrectiveDrafts.length;

  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Application</h2>

        <p className="mt-1 text-sm text-slate-500">
          Version {__APP_VERSION__}
        </p>

        {needRefresh ? (
          <div className="mt-4 rounded-2xl bg-yellow-100 p-4 text-sm text-yellow-900">
            New version available.
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={updateApp}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Update application
          </button>

          <button
            type="button"
            onClick={onSyncAll}
            disabled={totalPending === 0}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-white ${
              totalPending > 0 ? "bg-slate-900" : "bg-slate-300"
            }`}
          >
            Sync all pending items ({totalPending})
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Preventive reports pending sync
        </h2>

        <div className="mt-4 space-y-3">
          {pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {report.machineTag}
                      </h3>
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                        Preventive
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {report.vesselName} · {report.machineModel}
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(report.completedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSyncReport(report.id)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Sync
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Delete this preventive report?"
                        );
                        if (confirmed) onDeleteReport(report.id);
                      }}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
              No preventive reports pending sync.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Corrective drafts pending sync
        </h2>

        <div className="mt-4 space-y-3">
          {pendingCorrectiveDrafts.length > 0 ? (
            pendingCorrectiveDrafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {draft.machineTag}
                      </h3>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                        Corrective
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {draft.vesselName} · {draft.machineModel}
                    </p>

                    <p className="text-xs text-slate-400">
                      {new Date(draft.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSyncCorrectiveDraft(draft.id)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                      Sync
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Delete this corrective draft?"
                        );
                        if (confirmed) onDeleteCorrectiveDraft(draft.id);
                      }}
                      className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
              No corrective drafts pending sync.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}