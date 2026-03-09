import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type MachinePlan, type MachineMeta, type MaintenanceTask, type Vessel } from "../types/maintenance";
import { groupTasks } from "../utils/groupTasks";
import { MachineHeader } from "../components/MachineHeader";
import { SummaryCards } from "../components/SummaryCards";
import { CategorySection } from "../components/CategorySection";
import { MachineStatusField } from "../components/MachineStatusField";

type Props = {
  vessels: Vessel[];
  search: string;
  pendingOnly: boolean;
  onSearchChange: (value: string) => void;
  onTogglePendingOnly: () => void;
  onUpdateTask: (task: MaintenanceTask) => void;
  onUpdateMachineField: (field: keyof MachineMeta, value: string) => void;
  onFinishMaintenance: (vesselId: string, machineId: string) => void;
};

export function MachineDetailPage({
  vessels,
  search,
  pendingOnly,
  onSearchChange,
  onTogglePendingOnly,
  onUpdateTask,
  onUpdateMachineField,
  onFinishMaintenance,
}: Props) {
  const { vesselId, machineId } = useParams();

  const vessel = vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find(
    (item) => item.machine.id === machineId
  ) as MachinePlan | undefined;

  if (!plan || !vesselId || !machineId) {
    return <div className="p-6">Machine not found.</div>;
  }

  const grouped = groupTasks(plan.tasks, search, pendingOnly);

  const allChecked = useMemo(
    () => plan.tasks.length > 0 && plan.tasks.every((task) => task.checked),
    [plan.tasks]
  );

  return (
    <section className="space-y-4">
      <BackButton />

      <MachineHeader machine={plan.machine} />

      <MachineStatusField
        value={plan.machine.operatingStatus || "online"}
        downtimeReason={plan.machine.downtimeReason || ""}
        onStatusChange={(value) => {
          onUpdateMachineField("operatingStatus", value);

          if (value === "online") {
            onUpdateMachineField("downtimeReason", "");
          }
        }}
        onReasonChange={(value) => onUpdateMachineField("downtimeReason", value)}
      />

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

      <button
        type="button"
        disabled={!allChecked}
        onClick={() => onFinishMaintenance(vesselId, machineId)}
        className={`w-full rounded-2xl px-4 py-3 text-sm font-medium text-white ${
          allChecked ? "bg-slate-900" : "bg-slate-300"
        }`}
      >
        Finish maintenance
      </button>
    </section>
  );
}