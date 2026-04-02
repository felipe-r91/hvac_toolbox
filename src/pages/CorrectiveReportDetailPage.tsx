import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type CorrectiveDraft } from "../types/maintenance";

type Props = {
  correctiveDrafts: CorrectiveDraft[];
};

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
          <h1 className="text-2xl font-semibold text-slate-900">
            Corrective Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(draft.createdAt).toLocaleString()}
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

        <DetailSection title="Problem Summary" value={draft.problemSummary} />
        <DetailSection title="Condition Found" value={draft.conditionFound} />
        <DetailSection title="Symptoms Observed" value={draft.symptomsObserved} />
        <DetailSection title="Alarms / Abnormal Readings" value={draft.alarmsObserved} />
        <DetailSection title="Operational Impact" value={draft.operationalImpact} />
        <DetailSection title="Preliminary Diagnosis" value={draft.preliminaryDiagnosis} />
        <DetailSection title="Confirmed Cause" value={draft.confirmedCause} />
        <DetailSection title="Corrective Action Performed" value={draft.correctiveAction} />
        <DetailSection title="Recommendations" value={draft.recommendations} />
        <DetailSection title="Further Action Required" value={draft.furtherActionRequired} />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Machine Returned to Service
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            {draft.machineReturnedToService}
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

function DetailSection({ title, value }: { title: string; value: string }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
        {value || "—"}
      </p>
    </section>
  );
}