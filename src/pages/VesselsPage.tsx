import { useState } from "react";
import { Link } from "react-router-dom";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { EditVesselModal } from "../components/EditVesselModal";
import { type Vessel } from "../types/maintenance";
import { RiShipLine } from "react-icons/ri";
import { BiEditAlt } from "react-icons/bi";
import { LuTrash2 } from "react-icons/lu";

type Props = {
  vessels: Vessel[];
  onEditVessel: (payload: {
    id: string;
    name: string;
    imoNumber: string;
    description: string;
  }) => void;
  onDeleteVessel: (vesselId: string) => void;
};

export function VesselsPage({ vessels, onEditVessel, onDeleteVessel }: Props) {
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deletingVessel, setDeletingVessel] = useState<Vessel | null>(null);

  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-900">Ships</h1>
          <RiShipLine size={32} className="mt-2 text-slate-500" />
        </div>
        <p className="mt-1 text-sm text-slate-500">All registered ships across the fleet.</p>
      </section>
      {vessels.length === 0 ? (
        <section className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">No fleet data available</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sync the fleet registry to download vessels, machines, and maintenance plans for offline use.
            </p>
          </div>

        </section>
      )
        :
        (
          <section className="grid gap-3">
            {vessels.map((vessel) => (
              <div
                key={vessel.id}
                className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300"
              >
                <Link to={`/vessels/${vessel.id}/machines`} className="block text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{vessel.name}</h2>
                      <p className="text-sm text-slate-500">IMO: {vessel.imoNumber || "—"}</p>
                      <p className="text-sm text-slate-500">
                        {vessel.description || "No description"}
                      </p>
                    </div>

                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {vessel.machines.length} machines
                    </div>
                  </div>
                </Link>

                <div className="-mt-2.5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingVessel(vessel)}
                    className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-medium text-slate-900"
                  >
                    <BiEditAlt size={24} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingVessel(vessel)}
                    className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                  >
                    <LuTrash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}


      <EditVesselModal
        open={Boolean(editingVessel)}
        vessel={editingVessel}
        onClose={() => setEditingVessel(null)}
        onSave={onEditVessel}
      />

      <DeleteConfirmModal
        open={Boolean(deletingVessel)}
        title="Delete ship"
        description={`Are you sure you want to delete ${deletingVessel?.name || "this ship"}? This action will also remove its machines.`}
        onClose={() => setDeletingVessel(null)}
        onConfirm={() => {
          if (!deletingVessel) return;
          onDeleteVessel(deletingVessel.id);
        }}
      />
    </section>
  );
}