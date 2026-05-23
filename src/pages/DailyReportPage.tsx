import { useState } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { ReportPhotosSection } from "../components/ReportPhotosSection";
import { MachineFailureField } from "../components/MachineFailureField";
import { MachineHeader } from "../components/MachineHeader";
import { MachinePhotoSection } from "../components/MachinePhotoSection";
import {
  type ReportPhoto,
  type DailyDraft,
  type FailureCode,
  type FailureComponent,
  type FailureMode,
  type Vessel,
} from "../types/maintenance";
import { createId } from "../utils/createId";
import { compressImageFile } from "../utils/imageCompression";
import { deletePhotoBlob, savePhotoBlob } from "../storage/photoDb";

type Props = {
  vessels: Vessel[];
  onSaveDraft: (draft: DailyDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  getExistingDraft: (machineId: string) => DailyDraft | null;
  onAddMachinePhoto: (machineId: string, file: File) => void;
  onDeleteMachinePhoto: (machineId: string) => void;
};

export function DailyReportPage({
  vessels,
  onSaveDraft,
  onDeleteDraft,
  getExistingDraft,
  onAddMachinePhoto,
  onDeleteMachinePhoto,
}: Props) {
  const { vesselId, machineId } = useParams();

  const vessel = vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  const createEmptyDraft = (): DailyDraft | null => {
    if (!vessel || !plan) return null;

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
      createdAt: new Date().toISOString(),

      alarmPresent: false,
      reportCategory: "daily",

      failureComponent: undefined,
      failureMode: undefined,
      failureCode: undefined,
      failureNotes: "",

      workConductedToday: "",
      furtherActions: "",

      photos: [],
      synced: false,
    };
  };

  const [draft, setDraft] = useState<DailyDraft | null>(() => {
    if (!vessel || !plan || !machineId) return null;

    const existing = getExistingDraft(machineId);
    if (existing) return { ...existing, photos: existing.photos || [] };

    return createEmptyDraft();
  });

  if (!vessel || !plan || !draft) {
    return <div className="p-6">Machine not found.</div>;
  }

  const updateField = <K extends keyof DailyDraft>(
    field: K,
    value: DailyDraft[K]
  ) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateAlarmPresent = (alarmPresent: boolean) => {
    if (!alarmPresent) {
      setDraft((current) =>
        current
          ? {
              ...current,
              alarmPresent: false,
              failureComponent: undefined,
              failureMode: undefined,
              failureCode: undefined,
              failureNotes: "",
            }
          : current
      );
      return;
    }

    setDraft((current) =>
      current
        ? {
            ...current,
            alarmPresent: true,
          }
        : current
    );
  };

  const machinePhotoUrls = plan.machine.machinePhotoPreviewUrl
    ? [plan.machine.machinePhotoPreviewUrl]
    : [];

  const machinePhotoCount = machinePhotoUrls.length;
  const machinePhotoValid = machinePhotoCount > 0;

  const addPhoto = async (file: File) => {
    const compressedFile = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      mimeType: "image/jpeg",
    });

    const photoId = createId();
    const previewUrl = URL.createObjectURL(compressedFile);

    await savePhotoBlob({
      id: photoId,
      blob: compressedFile,
      filename: compressedFile.name,
      mimeType: compressedFile.type,
      createdAt: new Date().toISOString(),
    });

    const photo: ReportPhoto = {
      id: photoId,
      filename: compressedFile.name,
      caption: "",
      createdAt: new Date().toISOString(),
      previewUrl,
      blobStored: true,
    };

    setDraft((current) =>
      current
        ? {
            ...current,
            photos: [...(current.photos || []), photo],
          }
        : current
    );
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            photos: (current.photos || []).map((photo) =>
              photo.id === photoId ? { ...photo, caption } : photo
            ),
          }
        : current
    );
  };

  const deletePhoto = async (photoId: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            photos: (current.photos || []).filter((photo) => photo.id !== photoId),
          }
        : current
    );

    await deletePhotoBlob(photoId);
  };

  const saveDraftLocally = () => {
    onSaveDraft({
      ...draft,
      reportCategory: "daily",
      synced: false,
    });

    alert("Daily report saved locally.");
    setDraft(createEmptyDraft());
  };

  const clearCurrentDraft = () => {
    onDeleteDraft(draft.id);
    setDraft(createEmptyDraft());
  };

  const deleteLocalDraft = () => {
    const confirmed = window.confirm("Delete this local daily report?");
    if (!confirmed) return;

    clearCurrentDraft();
  };

  const canSaveDraft = draft.alarmPresent
    ? Boolean(
        machinePhotoValid &&
          draft.failureComponent &&
          draft.failureMode &&
          draft.failureCode &&
          draft.workConductedToday.trim()
      )
    : Boolean(machinePhotoValid && draft.workConductedToday.trim());

  return (
    <section className="space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            Daily Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Record the daily work performed and any alarm found during maintenance.
          </p>
        </section>

        <MachineHeader machine={plan.machine} />

        <MachinePhotoSection
          label="Machine Picture"
          required
          count={machinePhotoCount}
          previewUrls={machinePhotoUrls}
          onDeletePhoto={() => onDeleteMachinePhoto(plan.machine.id)}
          onPick={(file) => onAddMachinePhoto(plan.machine.id, file)}
        />

        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Alarm Present
              </h2>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={draft.alarmPresent}
              onClick={() => updateAlarmPresent(!draft.alarmPresent)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                draft.alarmPresent ? "bg-red-500" : "bg-green-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  draft.alarmPresent ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm font-medium">
            <span
              className={
                !draft.alarmPresent ? "text-green-700" : "text-slate-500"
              }
            >
              No alarm
            </span>
            <span
              className={
                draft.alarmPresent ? "text-red-700" : "text-slate-500"
              }
            >
              Alarm
            </span>
          </div>
        </section>

        <MachineFailureField
          title="Failure Detected during maintenance"
          operatingStatus={draft.alarmPresent ? "down" : "online"}
          failureComponent={draft.failureComponent || ""}
          failureMode={draft.failureMode || ""}
          failureCode={draft.failureCode || ""}
          failureNotes={draft.failureNotes}
          onFailureComponentChange={(value) =>
            updateField("failureComponent", value as FailureComponent)
          }
          onFailureModeChange={(value) =>
            updateField("failureMode", value as FailureMode)
          }
          onFailureCodeChange={(value) =>
            updateField("failureCode", value as FailureCode)
          }
          onFailureNotesChange={(value) => updateField("failureNotes", value)}
        />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Daily Work</h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Work conducted today
              </span>
              <textarea
                value={draft.workConductedToday}
                onChange={(e) =>
                  updateField("workConductedToday", e.target.value)
                }
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Describe the work completed during today's maintenance."
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Further Actions
              </span>
              <textarea
                value={draft.furtherActions}
                onChange={(e) => updateField("furtherActions", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Follow-up actions, parts required, monitoring, or handover notes."
              />
            </label>
          </div>
        </section>

        <ReportPhotosSection
          photos={draft.photos || []}
          onAddPhoto={addPhoto}
          onUpdateCaption={updatePhotoCaption}
          onDeletePhoto={deletePhoto}
        />

        {!machinePhotoValid ? (
          <p className="text-sm text-red-600">
            A machine identification photo is required before saving this daily report.
          </p>
        ) : null}

        {!canSaveDraft ? (
          <p className="text-sm text-red-600">
            {draft.alarmPresent
              ? "Machine photo, failure component, failure mode, failure code, and work conducted today are required."
              : "Machine photo and work conducted today are required."}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={saveDraftLocally}
            disabled={!canSaveDraft}
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              canSaveDraft
                ? "bg-white text-slate-700 ring-1 ring-slate-300"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            Save draft locally
          </button>

          <button
            type="button"
            onClick={deleteLocalDraft}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
          >
            Delete draft
          </button>
        </div>
    </section>
  );
}
