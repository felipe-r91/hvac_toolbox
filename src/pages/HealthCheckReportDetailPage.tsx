import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import {
  type HealthCheckDraft,
  type TaskStatus,
  type Vessel,
} from "../types/maintenance";

type Props = {
  healthCheckDrafts: HealthCheckDraft[];
  vessels: Vessel[];
};

export function HealthCheckReportDetailPage({
  healthCheckDrafts,
  vessels,
}: Props) {
  const { draftId } = useParams();

  const draft = useMemo(
    () => healthCheckDrafts.find((item) => item.id === draftId),
    [healthCheckDrafts, draftId]
  );

  if (!draft) {
    return <div className="p-6">Health check report not found.</div>;
  }

  const currentDraft = draft;
  const machine = vessels
    .flatMap((vessel) => vessel.machines)
    .find((plan) => plan.machine.id === currentDraft.machineId)?.machine;

  const machinePhotoUrls = machine?.machinePhotoPreviewUrl
    ? [machine.machinePhotoPreviewUrl]
    : [];

  function getTaskPhotos(taskId: string) {
    return currentDraft.taskPhotos.filter((photo) => photo.taskId === taskId);
  }

  function statusClasses(status: TaskStatus) {
    switch (status) {
      case "ok":
        return "bg-green-100 text-green-800 border-green-200";
      case "attention":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fault":
        return "bg-red-100 text-red-800 border-red-200";
      case "not-applicable":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "skipped":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  }

  return (
    <section className="space-y-4">
      <BackButton to="/vessels" />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">
          {currentDraft.machineTag} health check
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {currentDraft.vesselName} · {currentDraft.machineModel} ·{" "}
          {currentDraft.machineStarterType} · {currentDraft.machineType}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Serial Number: {currentDraft.machineSerialNumber}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Completed at:{" "}
          {new Date(currentDraft.completedAt || currentDraft.createdAt).toLocaleString()}
        </p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Machine Photos</h2>

        {machinePhotoUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {machinePhotoUrls.map((url) => (
              <div
                key={url}
                className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
              >
                <img
                  src={url}
                  alt="Machine photo"
                  className="h-56 w-full rounded-2xl object-cover"
                />

                <div className="mt-3 text-sm text-slate-700">Machine photo</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
            No machine photos attached.
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Task summary</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-200">
            Attention: {currentDraft.attentionCount || 0}
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-red-200">
            Faults: {currentDraft.faultCount || 0}
          </span>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 ring-1 ring-orange-200">
            Skipped: {currentDraft.skippedCount || 0}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {currentDraft.tasks.map((task) => {
            const taskPhotos = getTaskPhotos(task.id);

            return (
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

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                      task.status
                    )}`}
                  >
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

                {taskPhotos.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {taskPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl bg-white p-3 ring-1 ring-slate-200"
                      >
                        {photo.previewUrl ? (
                          <img
                            src={photo.previewUrl}
                            alt={task.task}
                            className="h-48 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                            Photo unavailable
                          </div>
                        )}

                        <div className="mt-3 text-sm text-slate-700">
                          {photo.filename || task.task}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}
