import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type CfrDraft } from "../types/maintenance";

type Props = {
  cfrDrafts: CfrDraft[];
};

function formatFailureCode(code?: string) {
  if (!code) return "—";

  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function CfrReportDetailPage({ cfrDrafts }: Props) {
  const { draftId } = useParams();

  const draft = cfrDrafts.find((item) => item.id === draftId);

  if (!draft) {
    return <div className="p-6">CFR not found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            Conditions Found Report
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(draft.createdAt).toLocaleString()}
          </p>
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
            <InfoCard label="Machine status" value={draft.machineStatus} />
          </div>
        </section>

        {draft.machineStatus === "down" ? (
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Failure Classification
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoCard label="Failure component" value={draft.failureComponent || "—"} />
              <InfoCard label="Failure mode" value={draft.failureMode || "—"} />
              <InfoCard label="Failure code" value={formatFailureCode(draft.failureCode)} />
            </div>
          </section>
        ) : null}

        <DetailSection title="Condition Found" value={draft.conditionFound} />
        <DetailSection title="Symptoms Observed" value={draft.symptomsObserved} />
        <DetailSection title="Alarms / Abnormal Readings" value={draft.alarmsObserved} />
        <DetailSection title="Operational Impact" value={draft.operationalImpact} />
        <DetailSection title="Preliminary Diagnosis" value={draft.preliminaryDiagnosis} />
        <DetailSection title="Confirmed Cause" value={draft.confirmedCause} />
        <DetailSection title="Recommendations" value={draft.recommendations} />
        <DetailSection title="Further Action Required" value={draft.furtherActionRequired} />
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