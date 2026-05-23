import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type Vessel } from "../types/maintenance";

type Props = {
  vessels: Vessel[];
};

export function MachineViewPage({ vessels }: Props) {
  const { machineId } = useParams();

  const vessel = vessels.find((item) =>
    item.machines.some((plan) => plan.machine.id === machineId)
  );

  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  if (!vessel || !plan) {
    return <div className="p-6">Machine not found.</div>;
  }

  const tasksByCategory = plan.tasks.reduce<Record<string, number>>((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">
            Machine Details
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Read-only machine information and maintenance template.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Machine</h2>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
            <InfoCard label="Ship" value={vessel.name} />
            <InfoCard label="Tag" value={plan.machine.tag} />
            <InfoCard label="Location" value={plan.machine.location} />
            <InfoCard label="Model" value={plan.machine.model} />
            <InfoCard label="Starter Type" value={plan.machine.starterType} />
            <InfoCard label="Type" value={plan.machine.type} />
            <InfoCard label="Serial Number" value={plan.machine.serialNumber || "—"} />
            <InfoCard label="Refrigerant" value={plan.machine.refrigerant || "—"} />
            <InfoCard label="Oil Type" value={plan.machine.oilType || "—"} />
            <InfoCard label="Control System" value={plan.machine.controlSystem || "—"} />
            <InfoCard label="Software Version" value={plan.machine.softwareVersion || "—"} />
            <InfoCard label="Compressor Type" value={plan.machine.compressorType || "—"} />
            <InfoCard label="MFG" value={plan.machine.mfg || "—"} />
            <InfoCard label="Task Template Size" value={`${plan.tasks.length} tasks`} />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Task Categories</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(tasksByCategory).map(([category, count]) => (
              <div
                key={category}
                className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
              >
                <div className="text-sm font-medium text-slate-900">{category}</div>
                <div className="mt-1 text-sm text-slate-500">{count} tasks</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Task Template</h2>

          <div className="mt-4 space-y-3">
            {plan.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200"
              >
                <div className="text-sm font-medium text-slate-900">{task.task}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {task.category} · Tool: {task.tool || "—"}
                </div>
              </div>
            ))}
          </div>
        </section>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm text-slate-900">{value}</div>
    </div>
  );
}
