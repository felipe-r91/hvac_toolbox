import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type CorrectiveDraft } from "../types/maintenance";

type Props = {
  correctiveDrafts: CorrectiveDraft[];
};

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatReturnedToService(value: CorrectiveDraft["machineReturnedToService"]) {
  switch (value) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    case "unknown":
    default:
      return "Unknown";
  }
}

export function CorrectiveReportDetailPage({ correctiveDrafts }: Props) {
  const { draftId } = useParams();

  const draft = correctiveDrafts.find((item) => item.id === draftId);

  if (!draft) {
    return <div className="p-6">Corrective report not found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Corrective Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(draft.createdAt).toLocaleString()}
              </p>
            </div>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Corrective
            </span>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Machine</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard label="Ship" value={draft.vesselName} />
            <InfoCard label="Tag" value={draft.machineTag} />
            <InfoCard label="Location" value={draft.machineLocation} />
            <InfoCard
              label="Model"
              value={`${draft.machineModel} · ${draft.machineStarterType}`}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Failure Classification
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <InfoCard
              label="Failure component"
              value={draft.failureComponent || "—"}
            />
            <InfoCard
              label="Failure mode"
              value={draft.failureMode || "—"}
            />
            <InfoCard
              label="Failure code"
              value={formatFailureCode(draft.failureCode)}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Fault Description
          </h2>

          <div className="mt-4 space-y-4">
            <DetailBlock title="Problem Summary" value={draft.problemSummary} />
            <DetailBlock title="Condition Found" value={draft.conditionFound} />
            <DetailBlock title="Symptoms Observed" value={draft.symptomsObserved} />
            <DetailBlock title="Alarms / Abnormal Readings" value={draft.alarmsObserved} />
            <DetailBlock title="Operational Impact" value={draft.operationalImpact} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Diagnosis</h2>

          <div className="mt-4 space-y-4">
            <DetailBlock
              title="Preliminary Diagnosis"
              value={draft.preliminaryDiagnosis}
            />
            <DetailBlock title="Confirmed Cause" value={draft.confirmedCause} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Corrective Actions
          </h2>

          <div className="mt-4 space-y-4">
            <DetailBlock
              title="Corrective Action Performed"
              value={draft.correctiveAction}
            />
            <DetailBlock title="Recommendations" value={draft.recommendations} />
            <DetailBlock
              title="Further Action Required"
              value={draft.furtherActionRequired}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Machine Returned to Service
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            {formatReturnedToService(draft.machineReturnedToService)}
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Photos</h2>

          {draft.photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {draft.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
                >
                  {photo.previewUrl ? (
                    <img
                      src={photo.previewUrl}
                      alt={photo.caption || "Corrective report photo"}
                      className="h-56 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
                      Photo unavailable
                    </div>
                  )}

                  <div className="mt-3 text-sm text-slate-700">
                    {photo.caption || "No caption"}
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    {photo.filename}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 ring-1 ring-slate-200">
              No photos attached.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{value}</div>
    </div>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}