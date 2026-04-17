import { useState } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { CorrectivePhotosSection } from "../components/CorrectivePhotosSection";
import {
  type CorrectiveDraft,
  type CorrectivePhoto,
  type FailureCode,
  type FailureComponent,
  type FailureMode,
  type Vessel,
} from "../types/maintenance";
import { createId } from "../utils/createId";
import { compressImageFile } from "../utils/imageCompression";
import { deletePhotoBlob, savePhotoBlob } from "../storage/photoDb";

const failureComponents: FailureComponent[] = [
  "Compressor",
  "Starter",
  "Oil-System",
  "Refrigerant-Circuit",
  "Sensor",
  "Water-Flow",
  "Controls",
  "Mechanical",
  "other",
];

const failureModes: FailureMode[] = [
  "Trip",
  "Overheating",
  "High-Pressure",
  "Low-Pressure",
  "Low-Oil-Pressure",
  "Electrical-Fault",
  "Sensor-Fault",
  "Leak",
  "Seized",
  "Communication-Fault",
  "other",
];

const failureCodes: { value: FailureCode; label: string }[] = [
  { value: "NO_REFRIGERANT_CHARGE", label: "No refrigerant charge" },
  { value: "REFRIGERANT_LEAK", label: "Refrigerant leak" },
  { value: "HIGH_DISCHARGE_PRESSURE", label: "High discharge pressure" },
  { value: "LOW_SUCTION_PRESSURE", label: "Low suction pressure" },
  { value: "LOW_OIL_PRESSURE", label: "Low oil pressure" },
  { value: "OIL_LEAK", label: "Oil leak" },
  { value: "STARTER_TRIP", label: "Starter trip" },
  { value: "MOTOR_OVERLOAD", label: "Motor overload" },
  { value: "PHASE_LOSS_OR_IMBALANCE", label: "Phase loss or imbalance" },
  { value: "SENSOR_SIGNAL_LOSS", label: "Sensor signal loss" },
  { value: "SENSOR_OUT_OF_CALIBRATION", label: "Sensor out of calibration" },
  { value: "COMMUNICATION_LOSS", label: "Communication loss" },
  { value: "CONTROL_POWER_FAILURE", label: "Control power failure" },
  { value: "WATER_FLOW_LOSS", label: "Water flow loss" },
  { value: "BRINE_FLOW_LOSS", label: "Brine flow loss" },
  { value: "SOLENOID_VALVE_FAILURE", label: "Solenoid valve failure" },
  { value: "EXPANSION_VALVE_FAILURE", label: "Expansion valve failure" },
  { value: "COMPRESSOR_NOT_RUNNING", label: "Compressor not running" },
  { value: "COMPRESSOR_MECHANICAL_DAMAGE", label: "Compressor mechanical damage" },
  { value: "HIGH_TEMPERATURE", label: "High temperature" },
  { value: "LOW_CAPACITY", label: "Low capacity" },
  { value: "UNKNOWN", label: "Unknown / not classified" },
];

type Props = {
  vessels: Vessel[];
  onSaveDraft: (draft: CorrectiveDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  getExistingDraft: (machineId: string) => CorrectiveDraft | null;
};

export function CorrectiveMaintenancePage({
  vessels,
  onSaveDraft,
  onDeleteDraft,
  getExistingDraft,
}: Props) {
  const { vesselId, machineId } = useParams();

  const vessel = vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  const createEmptyDraft = (): CorrectiveDraft | null => {
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

      failureComponent: undefined,
      failureMode: undefined,
      failureCode: undefined,

      problemSummary: "",
      conditionFound: "",
      symptomsObserved: "",
      alarmsObserved: "",
      operationalImpact: "",

      preliminaryDiagnosis: "",
      confirmedCause: "",

      correctiveAction: "",
      recommendations: "",
      furtherActionRequired: "",

      machineReturnedToService: "unknown",

      photos: [],
    };
  };

  const [draft, setDraft] = useState<CorrectiveDraft | null>(() => {
    if (!vessel || !plan || !machineId) return null;

    const existing = getExistingDraft(machineId);
    if (existing) return existing;

    return createEmptyDraft();
  });

  if (!vessel || !plan || !draft) {
    return <div className="p-6">Machine not found.</div>;
  }

  const updateField = <K extends keyof CorrectiveDraft>(
    field: K,
    value: CorrectiveDraft[K]
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

    const photo: CorrectivePhoto = {
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

  const saveDraftLocally = () => {
    const payload = { ...draft };
    onSaveDraft(payload);
    alert("Corrective draft saved locally.");
    setDraft(createEmptyDraft());
  };

  const clearCurrentDraft = () => {
    onDeleteDraft(draft.id);
    setDraft(createEmptyDraft());
  };

  const deleteLocalDraft = () => {
    const confirmed = window.confirm("Delete this local corrective draft?");
    if (!confirmed) return;

    clearCurrentDraft();
  };

  const canSaveDraft =
    Boolean(
      draft.failureComponent &&
        draft.failureMode &&
        draft.failureCode &&
        draft.problemSummary.trim() &&
        draft.conditionFound.trim()
    );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            Condition Found Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Capture a structured corrective event for technical reporting and recurring failure analysis.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Machine</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-500">Ship</div>
              <div className="mt-1 text-sm text-slate-900">{draft.vesselName}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-500">Tag</div>
              <div className="mt-1 text-sm text-slate-900">{draft.machineTag}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-500">Location</div>
              <div className="mt-1 text-sm text-slate-900">
                {draft.machineLocation}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="text-xs font-medium text-slate-500">Model</div>
              <div className="mt-1 text-sm text-slate-900">
                {draft.machineModel} · {draft.machineStarterType}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Failure Classification
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Use structured fields so recurring failures can be tracked accurately.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Failure component
              </span>
              <select
                value={draft.failureComponent || ""}
                onChange={(e) =>
                  updateField("failureComponent", e.target.value as FailureComponent)
                }
                className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
              >
                <option value="">Select component</option>
                {failureComponents.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Failure mode
              </span>
              <select
                value={draft.failureMode || ""}
                onChange={(e) =>
                  updateField("failureMode", e.target.value as FailureMode)
                }
                className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
              >
                <option value="">Select failure mode</option>
                {failureModes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Failure code
            </span>
            <select
              value={draft.failureCode || ""}
              onChange={(e) =>
                updateField("failureCode", e.target.value as FailureCode)
              }
              className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
            >
              <option value="">Select failure code</option>
              {failureCodes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Condition Found
          </h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Problem summary
              </span>
              <textarea
                value={draft.problemSummary}
                onChange={(e) => updateField("problemSummary", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Short summary of the issue found."
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Condition found
              </span>
              <textarea
                value={draft.conditionFound}
                onChange={(e) => updateField("conditionFound", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Describe the physical condition found on board."
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Symptoms observed
                </span>
                <textarea
                  value={draft.symptomsObserved}
                  onChange={(e) => updateField("symptomsObserved", e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                  placeholder="Noise, vibration, leakage, trip, overheating..."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Alarms / abnormal readings
                </span>
                <textarea
                  value={draft.alarmsObserved}
                  onChange={(e) => updateField("alarmsObserved", e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                  placeholder="Alarm codes, HMI messages, pressures, temperatures..."
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Operational impact
              </span>
              <textarea
                value={draft.operationalImpact}
                onChange={(e) => updateField("operationalImpact", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="How the fault affected operation."
              />
            </label>
          </div>
        </section>

        <CorrectivePhotosSection
          photos={draft.photos}
          onAddPhoto={addPhoto}
          onUpdateCaption={updatePhotoCaption}
          onDeletePhoto={deletePhoto}
        />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Diagnosis</h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Preliminary diagnosis
              </span>
              <textarea
                value={draft.preliminaryDiagnosis}
                onChange={(e) =>
                  updateField("preliminaryDiagnosis", e.target.value)
                }
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="What you believe caused the issue."
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Confirmed cause
              </span>
              <textarea
                value={draft.confirmedCause}
                onChange={(e) => updateField("confirmedCause", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Confirmed root cause, if identified."
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Recommendations / Actions
          </h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Corrective action performed
              </span>
              <textarea
                value={draft.correctiveAction}
                onChange={(e) => updateField("correctiveAction", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Describe what was done on board."
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
                placeholder="Recommended actions, repair plan, replacement, monitoring..."
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">
                Further action required
              </span>
              <textarea
                value={draft.furtherActionRequired}
                onChange={(e) =>
                  updateField("furtherActionRequired", e.target.value)
                }
                rows={3}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                placeholder="Parts required, follow-up visit, docking, shutdown, etc."
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

        {!canSaveDraft ? (
          <p className="text-sm text-red-600">
            Failure component, failure mode, failure code, problem summary, and condition found are required.
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
      </div>
    </main>
  );
}