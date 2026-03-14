import { type MachineMeta } from "../types/maintenance";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-900">{value || "—"}</div>
    </div>
  );
}

export function MachineHeader({ machine }: { machine: MachineMeta }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Machine Information</h1>
          <p className="text-sm text-slate-500">Field maintenance checklist</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {machine.type}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <Info label="Location" value={machine.location} />
        <Info label="Tag" value={machine.tag} />
        <Info label="Model" value={machine.model} />
        <Info label="Starter Type" value={machine.starterType} />
        <Info label="Serial N." value={machine.serialNumber} />
        <Info label="Type" value={machine.type} />
      </div>
    </section>
  );
}