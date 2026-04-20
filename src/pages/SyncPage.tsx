import { useState } from "react";
import { type CorrectiveDraft, type MaintenanceReport } from "../types/maintenance";
import { usePwaUpdater } from "../hooks/usePwaUpdater";
import { TbCloudDown, TbCloudUp, TbDeviceMobileDown } from "react-icons/tb";

export type SyncProgressInfo = {
  percent: number;
  label: string;
};

type Props = {
  reports: MaintenanceReport[];
  correctiveDrafts: CorrectiveDraft[];
  onSyncAll: (onProgress: (info: SyncProgressInfo) => void) => Promise<void>;
  onSyncReport: (
    reportId: string,
    onProgress: (info: SyncProgressInfo) => void
  ) => Promise<void>;
  onSyncCorrectiveDraft: (
    draftId: string,
    onProgress: (info: SyncProgressInfo) => void
  ) => Promise<void>;
  onDeleteReport: (reportId: string) => void;
  onDeleteCorrectiveDraft: (draftId: string) => void;
  onSyncOfflineRegistry: () => Promise<void>;
  fleetSyncLoading: boolean;
  fleetSyncError: string;
  fleetSyncSuccessMessage: string;
  templateSyncLoading: boolean;
  templateSyncError: string;
  templateSyncSuccessMessage: string;
  fleetRegistrySyncedAt?: string;
  maintenanceTemplateSyncedAt?: string;
};

export function SyncPage({
  reports,
  correctiveDrafts,
  onSyncAll,
  onSyncReport,
  onSyncCorrectiveDraft,
  onDeleteReport,
  onDeleteCorrectiveDraft,
  onSyncOfflineRegistry,
  fleetSyncLoading,
  fleetSyncError,
  fleetSyncSuccessMessage,
  templateSyncLoading,
  templateSyncError,
  templateSyncSuccessMessage,
  fleetRegistrySyncedAt,
  maintenanceTemplateSyncedAt,

}: Props) {
  const { needRefresh, updateApp } = usePwaUpdater();

  const [updateLoading, setUpdateLoading] = useState(false);

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncLabel, setSyncLabel] = useState("");

  const pendingReports = reports.filter((report) => !report.synced);
  const pendingCorrectiveDrafts = correctiveDrafts.filter((draft) => !draft.synced);
  const totalPending = pendingReports.length + pendingCorrectiveDrafts.length;

  const handleUpdateApp = async () => {
    setUpdateLoading(true);

    try {
      await updateApp();
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (totalPending === 0) return;

    setSyncLoading(true);
    setSyncProgress(0);
    setSyncLabel(`Preparing sync for ${totalPending} pending item${totalPending === 1 ? "" : "s"}...`);

    try {
      await onSyncAll(({ percent, label }) => {
        setSyncProgress(percent);
        setSyncLabel(label);
      });
    } finally {
      setSyncLoading(false);
      setSyncProgress(0);
      setSyncLabel("");
    }
  };

  const handleSyncReport = async (reportId: string, machineTag: string) => {
    setSyncLoading(true);
    setSyncProgress(0);
    setSyncLabel(`Preparing preventive report for ${machineTag}...`);

    try {
      await onSyncReport(reportId, ({ percent, label }) => {
        setSyncProgress(percent);
        setSyncLabel(label);
      });
    } finally {
      setSyncLoading(false);
      setSyncProgress(0);
      setSyncLabel("");
    }
  };

  const handleSyncCorrectiveDraft = async (draftId: string, machineTag: string) => {
    setSyncLoading(true);
    setSyncProgress(0);
    setSyncLabel(`Preparing corrective draft for ${machineTag}...`);

    try {
      await onSyncCorrectiveDraft(draftId, ({ percent, label }) => {
        setSyncProgress(percent);
        setSyncLabel(label);
      });
    } finally {
      setSyncLoading(false);
      setSyncProgress(0);
      setSyncLabel("");
    }
  };

  function formatSyncTime(value?: string) {
    if (!value) return "Never";
    return new Date(value).toLocaleString();
  }

  return (
    <section className="space-y-4">
      {updateLoading ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Updating application</h2>
          <p className="mt-1 text-sm text-slate-500">
            Downloading and applying the latest app version.
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-900" />
          </div>

          <p className="mt-2 text-sm font-medium text-slate-700">Please wait...</p>
        </section>
      ) : null}

      {syncLoading ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Sync in progress</h2>

          <p className="mt-1 text-sm text-slate-500">
            {syncLabel || "Synchronizing local reports."}
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-200"
              style={{ width: `${syncProgress}%` }}
            />
          </div>

          <p className="mt-2 text-sm font-medium text-slate-700">{syncProgress}%</p>
        </section>
      ) : null}

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        
        <div className="w-full flex gap-3 justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Application</h2>
      <p className="mt-1 text-sm text-slate-500">Version {__APP_VERSION__}</p>
          </div>
          
          <button
            type="button"
            onClick={handleUpdateApp}
            disabled={updateLoading || syncLoading || fleetSyncLoading}
            className="flex justify-center items-center gap-4  rounded-2xl px-4 py-3 text-sm font-medium text-slate-900"
          >
            <TbDeviceMobileDown size={30} />
          </button>
        </div>
        

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-medium text-slate-500">
              Last fleet registry sync
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {formatSyncTime(fleetRegistrySyncedAt)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-medium text-slate-500">
              Last maintenance template sync
            </div>
            <div className="mt-1 text-sm text-slate-900">
              {formatSyncTime(maintenanceTemplateSyncedAt)}
            </div>
          </div>
        </div>

        {needRefresh ? (
          <div className="mt-4 rounded-2xl bg-yellow-100 p-4 text-sm text-yellow-900">
            New version available.
          </div>
        ) : null}

        <div className="mt-4 flex gap-3 flex-col sm:flex-row">
          

          <button type="button"
            onClick={onSyncOfflineRegistry}
            disabled={updateLoading || syncLoading || fleetSyncLoading || templateSyncLoading}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-white flex gap-3 items-center ${!updateLoading &&
              !syncLoading &&
              !fleetSyncLoading &&
              !templateSyncLoading
              ? "bg-slate-900"
              : "bg-slate-300"
              }`}
          >
            <TbCloudDown size={24} />
            {fleetSyncLoading || templateSyncLoading
              ? "Syncing offline data..."
              : "Sync offline data"}
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={totalPending === 0 || updateLoading || syncLoading || fleetSyncLoading}
            className={`rounded-2xl px-4 py-3 text-sm font-medium text-white flex gap-3 items-center ${totalPending > 0 && !updateLoading && !syncLoading && !fleetSyncLoading
              ? "bg-slate-900"
              : "bg-slate-300"
              }`}
          >
            <TbCloudUp size={24} />
            Upload all pending items ({totalPending})
          </button>
        </div>
        {templateSyncSuccessMessage ? (
          <div className="mt-4 rounded-2xl bg-green-100 p-4 text-sm text-green-800">
            {templateSyncSuccessMessage}
          </div>
        ) : null}

        {templateSyncError ? (
          <div className="mt-4 rounded-2xl bg-red-100 p-4 text-sm text-red-800">
            {templateSyncError}
          </div>
        ) : null}

        {fleetSyncSuccessMessage ? (
          <div className="mt-4 rounded-2xl bg-green-100 p-4 text-sm text-green-800">
            {fleetSyncSuccessMessage}
          </div>
        ) : null}

        {fleetSyncError ? (
          <div className="mt-4 rounded-2xl bg-red-100 p-4 text-sm text-red-800">
            {fleetSyncError}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Preventive reports pending upload
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
                      onClick={() => handleSyncReport(report.id, report.machineTag)}
                      disabled={updateLoading || syncLoading}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium text-white ${updateLoading || syncLoading ? "bg-slate-300" : "bg-slate-900"
                        }`}
                    >
                      Upload
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm("Delete this preventive report?");
                        if (confirmed) onDeleteReport(report.id);
                      }}
                      disabled={updateLoading || syncLoading}
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
              No preventive reports pending upload.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Corrective drafts pending upload
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
                      onClick={() => handleSyncCorrectiveDraft(draft.id, draft.machineTag)}
                      disabled={updateLoading || syncLoading}
                      className={`rounded-2xl px-4 py-2 text-sm font-medium text-white ${updateLoading || syncLoading ? "bg-slate-300" : "bg-slate-900"
                        }`}
                    >
                      Upload
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm("Delete this corrective draft?");
                        if (confirmed) onDeleteCorrectiveDraft(draft.id);
                      }}
                      disabled={updateLoading || syncLoading}
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
              No corrective drafts pending upload.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}