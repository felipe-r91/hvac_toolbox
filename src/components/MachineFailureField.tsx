import { type FailureComponent, type FailureMode } from "../types/maintenance";

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

type Props = {
  operatingStatus: "online" | "down";
  failureComponent: string;
  failureMode: string;
  failureNotes: string;
  onFailureComponentChange: (value: FailureComponent) => void;
  onFailureModeChange: (value: FailureMode) => void;
  onFailureNotesChange: (value: string) => void;
};

export function MachineFailureField({
  operatingStatus,
  failureComponent,
  failureMode,
  failureNotes,
  onFailureComponentChange,
  onFailureModeChange,
  onFailureNotesChange,
}: Props) {
  if (operatingStatus !== "down") return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Failure report</h2>
      <p className="mt-1 text-sm text-slate-500">
        Select the failed component and failure mode.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Failure component
          </span>
          <select
            value={failureComponent}
            onChange={(e) => onFailureComponentChange(e.target.value as FailureComponent)}
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
            value={failureMode}
            onChange={(e) => onFailureModeChange(e.target.value as FailureMode)}
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
          Failure notes
        </span>
        <textarea
          value={failureNotes}
          onChange={(e) => onFailureNotesChange(e.target.value)}
          rows={4}
          placeholder="Describe alarms, trip sequence, measured symptoms, and anything relevant to troubleshooting."
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none"
        />
      </label>
    </section>
  );
}