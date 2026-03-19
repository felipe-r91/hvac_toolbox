import { useState } from "react";
import { Link } from "react-router-dom";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { EditMachineModal } from "../components/EditMachineModal";
import { createTasksFromModel } from "../data/maintenancePlanLibrary";
import { type MachinePlan, type MaintenanceTask, type Vessel } from "../types/maintenance";
import { LuThermometerSnowflake, LuTrash2 } from "react-icons/lu";
import { BiEditAlt } from "react-icons/bi";

type Props = {
  vessels: Vessel[];
  onEditMachine: (payload: {
    vesselId: string;
    machineId: string;
    location: string;
    tag: string;
    model: string;
    serialNumber: string;
    type: string;
    starterType: string;
    tasks: MaintenanceTask[];
  }) => void;
  onDeleteMachine: (payload: { vesselId: string; machineId: string }) => void;
};

type EditingMachine = {
  vesselId: string;
  vesselName: string;
  plan: MachinePlan;
};

export function MachinesPage({ vessels, onEditMachine, onDeleteMachine }: Props) {
  const machineItems = vessels.flatMap((vessel) =>
    vessel.machines.map((plan) => ({
      vesselId: vessel.id,
      vesselName: vessel.name,
      plan,
    }))
  );

  const [editingMachine, setEditingMachine] = useState<EditingMachine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<EditingMachine | null>(null);

  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Machines</h1>
          <LuThermometerSnowflake size={28} className="ml-3 mt-1 text-slate-500" />
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Manage registered machines across the fleet.
        </p>
      </section>

      <section className="grid gap-3">
        {machineItems.map(({ vesselId, vesselName, plan }) => (
          <div
            key={plan.machine.id}
            className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300"
          >
            <Link
              to={`/machines/${plan.machine.id}`}
              className="block"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {plan.machine.tag}
                  </h2>
                  <p className="text-sm text-slate-500">{plan.machine.location}</p>
                  <p className="text-sm text-slate-500">
                    {plan.machine.model} · {plan.machine.starterType} · {plan.machine.type}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Ship: {vesselName}</p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {plan.tasks.length} tasks
                </div>
              </div>
            </Link>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMachine({ vesselId, vesselName, plan })}
                className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-slate-900"
              >
                <BiEditAlt size={24} />
              </button>

              <button
                type="button"
                onClick={() => setDeletingMachine({ vesselId, vesselName, plan })}
                className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
              >
                <LuTrash2 size={24} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <EditMachineModal
        open={Boolean(editingMachine)}
        machine={editingMachine}
        onClose={() => setEditingMachine(null)}
        onSave={(payload) => {
          if (!editingMachine) return;

          const oldModel = editingMachine.plan.machine.model;
          const oldStarter = editingMachine.plan.machine.starterType;

          const tasks =
            payload.model === oldModel && payload.starterType === oldStarter
              ? editingMachine.plan.tasks
              : createTasksFromModel(payload.model, payload.starterType);

          onEditMachine({
            ...payload,
            tasks,
          });

          setEditingMachine(null);
        }}
      />

      <DeleteConfirmModal
        open={Boolean(deletingMachine)}
        title="Delete machine"
        description={`Are you sure you want to delete ${
          deletingMachine?.plan.machine.tag || "this machine"
        } from ${deletingMachine?.vesselName || "this ship"}?`}
        onClose={() => setDeletingMachine(null)}
        onConfirm={() => {
          if (!deletingMachine) return;

          onDeleteMachine({
            vesselId: deletingMachine.vesselId,
            machineId: deletingMachine.plan.machine.id,
          });

          setDeletingMachine(null);
        }}
      />
    </section>
  );
}