import {
  type FailureCode,
  type FailureComponent,
  type FailureMode,
} from "../types/maintenance";

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
  operatingStatus: "online" | "down";
  failureComponent: string;
  failureMode: string;
  failureCode: string;
  failureNotes: string;
  onFailureComponentChange: (value: FailureComponent) => void;
  onFailureModeChange: (value: FailureMode) => void;
  onFailureCodeChange: (value: FailureCode) => void;
  onFailureNotesChange: (value: string) => void;
};

export function MachineFailureField({
  operatingStatus,
  failureComponent,
  failureMode,
  failureCode,
  failureNotes,
  onFailureComponentChange,
  onFailureModeChange,
  onFailureCodeChange,
  onFailureNotesChange,
}: Props) {
  if (operatingStatus !== "down") return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">
        Failure detected during maintenance
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Classify the failure using structured fields so the office app can track recurring issues.
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
          Failure code
        </span>
        <select
          value={failureCode}
          onChange={(e) => onFailureCodeChange(e.target.value as FailureCode)}
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