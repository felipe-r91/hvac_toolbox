import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type MachinePlan, type MachineMeta, type MaintenanceTask, type Vessel } from "../types/maintenance";
import { groupTasks } from "../utils/groupTasks";
import { downloadJsonFile } from "../utils/downloadJson";
import { MachineHeader } from "../components/MachineHeader";
import { SummaryCards } from "../components/SummaryCards";
import { CategorySection } from "../components/CategorySection";

type Props = {
  vessels: Vessel[];
  search: string;
  pendingOnly: boolean;
  onSearchChange: (value: string) => void;
  onTogglePendingOnly: () => void;
  onUpdateTask: (task: MaintenanceTask) => void;
  onUpdateMachineField: (field: keyof MachineMeta, value: string) => void;
};

export function MachineDetailPage({
  vessels,
  search,
  pendingOnly,
  onSearchChange,
  onTogglePendingOnly,
  onUpdateTask,
}: Props) {
  const { vesselId, machineId } = useParams();
  const vessel = vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId) as MachinePlan | undefined;

  if (!plan) {
    return <div className="p-6">Machine not found.</div>;
  }

  const grouped = groupTasks(plan.tasks, search, pendingOnly);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <BackButton />
      <MachineHeader machine={plan.machine} />

      <SummaryCards tasks={plan.tasks} />

      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search task, category, tool..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none sm:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onTogglePendingOnly}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {pendingOnly ? "Show all" : "Pending only"}
            </button>

            <button
              type="button"
              onClick={() => downloadJsonFile(plan, `${plan.machine.tag || "machine"}-maintenance.json`)}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-300"
            >
              Export JSON
            </button>
          </div>
        </div>
      </section>

      {grouped.map((section) => (
        <CategorySection
          key={section.category}
          category={section.category}
          tasks={section.tasks}
          onUpdateTask={onUpdateTask}
        />
      ))}
      </div>
    </main>
  );
}