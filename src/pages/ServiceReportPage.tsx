import { useState } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { MachineHeader } from "../components/MachineHeader";
import { MachinePhotoSection } from "../components/MachinePhotoSection";
import { ReportPhotosSection } from "../components/ReportPhotosSection";
import { type ReportPhoto, type ServiceReportDraft, type Vessel } from "../types/maintenance";
import { createId } from "../utils/createId";
import { compressImageFile } from "../utils/imageCompression";
import { deletePhotoBlob, savePhotoBlob } from "../storage/photoDb";

type Props = {
  vessels: Vessel[];
  onSaveDraft: (draft: ServiceReportDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  getExistingDraft: (machineId: string) => ServiceReportDraft | null;
  onAddMachinePhoto: (machineId: string, file: File) => void;
  onDeleteMachinePhoto: (machineId: string) => void;
};

export function ServiceReportPage({
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

  const createEmptyDraft = (): ServiceReportDraft | null => {
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
      reportCategory: "service_report",
      workPerformed: "",
      recommendations: "",
      furtherActionRequired: "",
      machineReturnedToService: "unknown",
      photos: [],
      synced: false,
    };
  };

  const [draft, setDraft] = useState<ServiceReportDraft | null>(() => {
    if (!vessel || !plan || !machineId) return null;

    const existing = getExistingDraft(machineId);
    if (existing) return existing;

    return createEmptyDraft();
  });

  if (!vessel || !plan || !draft) {
    return <div className="p-6">Machine not found.</div>;
  }

  const updateField = <K extends keyof ServiceReportDraft>(
    field: K,
    value: ServiceReportDraft[K]
  ) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

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
          photos: [...current.photos, photo],
        }
        : current
    );
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setDraft((current) =>
      current
        ? {
          ...current,
          photos: current.photos.map((photo) =>
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
          photos: current.photos.filter((photo) => photo.id !== photoId),
        }
        : current
    );

    await deletePhotoBlob(photoId);
  };

  const machinePhotoUrls = plan.machine.machinePhotoPreviewUrl
    ? [plan.machine.machinePhotoPreviewUrl]
    : [];

  const machinePhotoValid = machinePhotoUrls.length > 0;
  const canSaveDraft = Boolean(machinePhotoValid && draft.workPerformed.trim());

  const saveDraftLocally = () => {
    onSaveDraft({
      ...draft,
      reportCategory: "service_report",
      synced: false,
    });

    alert("Service report saved locally.");
    setDraft(createEmptyDraft());
  };

  const deleteLocalDraft = () => {
    const confirmed = window.confirm("Delete this local service report?");
    if (!confirmed) return;

    onDeleteDraft(draft.id);
    setDraft(createEmptyDraft());
  };

  return (
    <section className="space-y-4">
      <BackButton />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Service Report</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record the work conducted and the final machine status.
        </p>
      </section>

      <MachineHeader machine={plan.machine} />

      <MachinePhotoSection
        label="Machine Picture"
        required
        count={machinePhotoUrls.length}
        previewUrls={machinePhotoUrls}
        onDeletePhoto={() => onDeleteMachinePhoto(plan.machine.id)}
        onPick={(file) => onAddMachinePhoto(plan.machine.id, file)}
      />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Work Conducted</h2>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Work performed
            </span>
            <textarea
              value={draft.workPerformed}
              onChange={(e) => updateField("workPerformed", e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
              placeholder="Describe the service work completed on board."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Recommendations
            </span>
            <textarea
              value={draft.recommendations}
              onChange={(e) => updateField("recommendations", e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
              placeholder="Recommended monitoring, repairs, parts, or follow-up actions."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Further Action Required
            </span>
            <textarea
              value={draft.furtherActionRequired}
              onChange={(e) => updateField("furtherActionRequired", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
              placeholder="Parts required, follow-up visit, shutdown, docking, etc."
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Machine returned to service
            </span>
            <select
              value={draft.machineReturnedToService}
              onChange={(e) =>
                updateField(
                  "machineReturnedToService",
                  e.target.value as "yes" | "no" | "unknown"
                )
              }
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
            >
              <option value="unknown">Unknown</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
      </section>

      <ReportPhotosSection
        photos={draft.photos}
        onAddPhoto={addPhoto}
        onUpdateCaption={updatePhotoCaption}
        onDeletePhoto={deletePhoto}
      />

      {!machinePhotoValid ? (
        <p className="text-sm text-red-600">
          A machine identification photo is required before saving this service report.
        </p>
      ) : null}

      {!canSaveDraft ? (
        <p className="text-sm text-red-600">
          Machine photo and work performed are required.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={saveDraftLocally}
          disabled={!canSaveDraft}
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${canSaveDraft
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
