import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type DailyDraft } from "../types/maintenance";

type Props = {
  dailyDrafts: DailyDraft[];
};

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function DailyReportDetailPage({ dailyDrafts }: Props) {
  const { draftId } = useParams();

  const draft = dailyDrafts.find((item) => item.id === draftId);

  if (!draft) {
    return <div className="p-6">Daily report not found.</div>;
  }

  return (
    <section className="space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Daily Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(draft.createdAt).toLocaleString()}
              </p>
            </div>

            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
              Daily
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
            <InfoCard
              label="Alarm present"
              value={draft.alarmPresent ? "Yes" : "No"}
            />
          </div>
        </section>

        {draft.alarmPresent ? (
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Failure Classification
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard
                label="Failure component"
                value={draft.failureComponent || "—"}
              />
              <InfoCard label="Failure mode" value={draft.failureMode || "—"} />
              <InfoCard
                label="Failure code"
                value={formatFailureCode(draft.failureCode)}
              />
            </div>

            <DetailBlock title="Failure Notes" value={draft.failureNotes} />
          </section>
        ) : null}

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Daily Work</h2>

          <div className="mt-4 space-y-4">
            <DetailBlock
              title="Work Conducted Today"
              value={draft.workConductedToday}
            />
            <DetailBlock title="Further Actions" value={draft.furtherActions} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Photos</h2>

          {(draft.photos || []).length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(draft.photos || []).map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
                >
                  {photo.previewUrl ? (
                    <img
                      src={photo.previewUrl}
                      alt={photo.caption || "Daily report photo"}
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
    </section>
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
