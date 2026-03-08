import { type MaintenanceTask } from "../types/maintenance";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export function SummaryCards({ tasks }: { tasks: MaintenanceTask[] }) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.checked).length;
  const faults = tasks.filter((task) => task.status === "fault").length;
  const attention = tasks.filter((task) => task.status === "attention").length;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total" value={String(total)} />
      <StatCard label="Completed" value={String(completed)} />
      <StatCard label="Attention" value={String(attention)} />
      <StatCard label="Faults" value={String(faults)} />
    </section>
  );
}