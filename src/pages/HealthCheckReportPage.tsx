import { useState } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { CategorySection } from "../components/CategorySection";
import { MachineHeader } from "../components/MachineHeader";
import { MachinePhotoSection } from "../components/MachinePhotoSection";
import { SummaryCards } from "../components/SummaryCards";
import {
  type HealthCheckDraft,
  type HealthCheckTaskPhoto,
  type MaintenanceTask,
  type Vessel,
} from "../types/maintenance";
import {
  createHealthCheckTasks,
  getHealthCheckTemplateMeta,
} from "../data/healthCheckPlanLibrary";
import { groupTasks } from "../utils/groupTasks";
import { createId } from "../utils/createId";
import { compressImageFile } from "../utils/imageCompression";
import { deletePhotoBlob, savePhotoBlob } from "../storage/photoDb";

type Props = {
  vessels: Vessel[];
  onSaveDraft: (draft: HealthCheckDraft) => void;
  getExistingDraft: (machineId: string) => HealthCheckDraft | null;
  onAddMachinePhoto: (machineId: string, file: File) => void;
  onDeleteMachinePhoto: (machineId: string) => void;
};

export function HealthCheckReportPage({
  vessels,
  onSaveDraft,
  getExistingDraft,
  onAddMachinePhoto,
  onDeleteMachinePhoto,
}: Props) {
  const { vesselId, machineId } = useParams();
  const [search, setSearch] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const vessel = vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  const createEmptyDraft = (): HealthCheckDraft | null => {
    if (!vessel || !plan) return null;

    const template = getHealthCheckTemplateMeta();
    const tasks = createHealthCheckTasks();

    if (!template || tasks.length === 0) return null;

    return {
      id: createId(),
      vesselId: vessel.id,
      vesselName: vessel.name,
      machineId: plan.machine.id,
      machineTag: plan.machine.tag,
      machineModel: plan.machine.model,
      machineType: plan.machine.type,
      machineStarterType: plan.machine.starterType,
      machineLocation: plan.machine.location,
      machineSerialNumber: plan.machine.serialNumber,
      createdAt: new Date().toISOString(),
      reportCategory: "health_check",
      templateCode: template.code,
      templateName: template.name,
      templateVersionId: template.versionId,
      templateVersionNumber: template.versionNumber,
      tasks,
      taskPhotos: [],
      synced: false,
    };
  };

  const [draft, setDraft] = useState<HealthCheckDraft | null>(() => {
    if (!machineId) return null;

    const existing = getExistingDraft(machineId);
    if (existing) return existing;

    return createEmptyDraft();
  });

  if (!vessel || !plan || !vesselId || !machineId) {
    return <div className="p-6">Machine not found.</div>;
  }

  if (!draft) {
    return (
      <section className="space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            Health Check Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Health Check templates are not available offline yet. Sync offline
            data before creating this report.
          </p>
        </section>
      </section>
    );
  }

  const grouped = groupTasks(draft.tasks, search, pendingOnly);
  const machinePhotoUrls = plan.machine.machinePhotoPreviewUrl
    ? [plan.machine.machinePhotoPreviewUrl]
    : [];

  const machinePhotoCount = machinePhotoUrls.length;
  const machinePhotoValid = machinePhotoCount > 0;

  const getTaskPhotoCount = (taskId: string) =>
    draft.taskPhotos.filter((photo) => photo.taskId === taskId).length;

  const getTaskPhotoUrls = (taskId: string) =>
    draft.taskPhotos
      .filter((photo) => photo.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((photo) => photo.previewUrl)
      .filter((url): url is string => Boolean(url));

  const allRequiredTaskPhotosValid = draft.tasks.every((task) => {
    const taskPhotoCount = getTaskPhotoCount(task.id);
    const needsPhoto = task.status === "fault" || task.status === "attention";
    return !needsPhoto || taskPhotoCount > 0;
  });

  const canFinish = Boolean(
    machinePhotoValid &&
      draft.tasks.length > 0 &&
      draft.tasks.every((task) => task.checked) &&
      allRequiredTaskPhotosValid
  );

  const updateTask = (task: MaintenanceTask) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((item) => (item.id === task.id ? task : item)),
          }
        : current
    );
  };

  const addTaskPhoto = async (taskId: string, file: File) => {
    const compressedFile = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      mimeType: "image/jpeg",
    });

    const photoId = createId();
    const previewUrl = URL.createObjectURL(compressedFile);
    const createdAt = new Date().toISOString();

    await savePhotoBlob({
      id: photoId,
      blob: compressedFile,
      filename: compressedFile.name,
      mimeType: compressedFile.type,
      createdAt,
    });

    const photo: HealthCheckTaskPhoto = {
      id: photoId,
      taskId,
      filename: compressedFile.name,
      mimeType: compressedFile.type,
      createdAt,
      previewUrl,
      blobStored: true,
    };

    setDraft((current) =>
      current
        ? {
            ...current,
            taskPhotos: [...current.taskPhotos, photo],
            tasks: current.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    photoIds: [...(task.photoIds || []), photoId],
                  }
                : task
            ),
          }
        : current
    );
  };

  const deleteTaskPhoto = async (taskId: string, previewUrl: string) => {
    const photo = draft.taskPhotos.find(
      (item) => item.taskId === taskId && item.previewUrl === previewUrl
    );

    if (!photo) return;

    setDraft((current) =>
      current
        ? {
            ...current,
            taskPhotos: current.taskPhotos.filter((item) => item.id !== photo.id),
            tasks: current.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    photoIds: (task.photoIds || []).filter((id) => id !== photo.id),
                  }
                : task
            ),
          }
        : current
    );

    await deletePhotoBlob(photo.id);
  };

  const finishHealthCheck = () => {
    const completedAt = new Date().toISOString();
    const payload: HealthCheckDraft = {
      ...draft,
      completedAt,
      reportCategory: "health_check",
      synced: false,
      faultCount: draft.tasks.filter((task) => task.status === "fault").length,
      attentionCount: draft.tasks.filter((task) => task.status === "attention").length,
      skippedCount: draft.tasks.filter((task) => task.status === "skipped").length,
    };

    setDraft(payload);
    onSaveDraft(payload);
    alert("Health check report saved locally.");
  };

  return (
    <section className="space-y-4">
      <BackButton />

      <MachineHeader machine={plan.machine} />

      <MachinePhotoSection
        label="Machine Picture"
        required
        count={machinePhotoCount}
        previewUrls={machinePhotoUrls}
        onDeletePhoto={() => onDeleteMachinePhoto(plan.machine.id)}
        onPick={(file) => onAddMachinePhoto(plan.machine.id, file)}
      />

      <SummaryCards tasks={draft.tasks} />

      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task, category, tool..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none sm:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPendingOnly((value) => !value)}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {pendingOnly ? "Show all" : "Pending only"}
            </button>
          </div>
        </div>
      </section>

      {grouped.map((section) => (
        <CategorySection
          key={section.category}
          category={section.category}
          tasks={section.tasks}
          onUpdateTask={updateTask}
          onAddTaskPhoto={addTaskPhoto}
          getTaskPhotoCount={getTaskPhotoCount}
          getTaskPhotoUrls={getTaskPhotoUrls}
          onDeleteTaskPhoto={deleteTaskPhoto}
        />
      ))}

      {!machinePhotoValid ? (
        <p className="text-sm text-red-600">
          A machine identification photo is required before finishing this health check.
        </p>
      ) : null}

      {!allRequiredTaskPhotosValid ? (
        <p className="text-sm text-red-600">
          Tasks marked as fault or attention must have at least one photo.
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canFinish}
        onClick={finishHealthCheck}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-medium text-white ${
          canFinish ? "bg-slate-900" : "bg-slate-300"
        }`}
      >
        Finish health check
      </button>
    </section>
  );
}
