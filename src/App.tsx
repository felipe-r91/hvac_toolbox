import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { loadFleet, resetFleet, saveFleet } from "./storage/maintenanceStorage";
import {
  type FleetData,
  type MachineMeta,
  type MaintenanceTask,
  type NewMachinePayload,
  type NewVesselPayload,
} from "./types/maintenance";
import { VesselsPage } from "./pages/VesselsPage";
import { ShipMachinesPage } from "./pages/ShipMachinesPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
import { SyncPage } from "./pages/SyncPage";
import { SettingsPage } from "./pages/SettingsPage";
import { createId } from "./utils/createId";

function MachineDetailRoute({
  fleet,
  search,
  pendingOnly,
  onSearchChange,
  onTogglePendingOnly,
  onUpdateTask,
  onUpdateMachineField,
}: {
  fleet: FleetData;
  search: string;
  pendingOnly: boolean;
  onSearchChange: (value: string) => void;
  onTogglePendingOnly: () => void;
  onUpdateTask: (vesselId: string, machineId: string, task: MaintenanceTask) => void;
  onUpdateMachineField: (vesselId: string, machineId: string, field: keyof MachineMeta, value: string) => void;
}) {
  const { vesselId = "", machineId = "" } = useParams();

  return (
    <MachineDetailPage
      vessels={fleet.vessels}
      search={search}
      pendingOnly={pendingOnly}
      onSearchChange={onSearchChange}
      onTogglePendingOnly={onTogglePendingOnly}
      onUpdateTask={(task) => onUpdateTask(vesselId, machineId, task)}
      onUpdateMachineField={(field, value) => onUpdateMachineField(vesselId, machineId, field, value)}
    />
  );
}

export default function App() {
  const [fleet, setFleet] = useState<FleetData>(() => loadFleet());
  const [search, setSearch] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addVesselOpen, setAddVesselOpen] = useState(false);
  const [addMachineOpen, setAddMachineOpen] = useState(false);

  useEffect(() => {
    saveFleet(fleet);
  }, [fleet]);

  const addVessel = (payload: NewVesselPayload) => {
    setFleet((current) => ({
      vessels: [
        ...current.vessels,
        {
          id: createId(),
          name: payload.name,
          imoNumber: payload.imoNumber,
          description: payload.description,
          machines: [],
        },
      ],
    }));
    console.log(fleet)
  };

  const addMachine = (payload: NewMachinePayload & { tasks: MaintenanceTask[] }) => {
  setFleet((current) => ({
    vessels: current.vessels.map((vessel) => {
      if (vessel.id !== payload.vesselId) return vessel;

      return {
        ...vessel,
        machines: [
          ...vessel.machines,
          {
            machine: {
              id: createId(),
              location: payload.location,
              tag: payload.tag,
              model: payload.model,
              serialNumber: payload.serialNumber,
              type: payload.type,
            },
            tasks: payload.tasks.map((entry) => ({ ...entry })),
          },
        ],
      };
    }),
  }));
};

  const updateTask = (vesselId: string, machineId: string, task: MaintenanceTask) => {
    setFleet((current) => ({
      vessels: current.vessels.map((vessel) => {
        if (vessel.id !== vesselId) return vessel;
        return {
          ...vessel,
          machines: vessel.machines.map((plan) => {
            if (plan.machine.id !== machineId) return plan;
            return {
              ...plan,
              tasks: plan.tasks.map((item) => (item.id === task.id ? task : item)),
            };
          }),
        };
      }),
    }));
  };

  const updateMachineField = (vesselId: string, machineId: string, field: keyof MachineMeta, value: string) => {
    setFleet((current) => ({
      vessels: current.vessels.map((vessel) => {
        if (vessel.id !== vesselId) return vessel;
        return {
          ...vessel,
          machines: vessel.machines.map((plan) => {
            if (plan.machine.id !== machineId) return plan;
            return {
              ...plan,
              machine: {
                ...plan.machine,
                [field]: value,
              },
            };
          }),
        };
      }),
    }));
  };

  const editVessel = (payload: {
  id: string;
  name: string;
  imoNumber: string;
  description: string;
}) => {
  setFleet((current) => ({
    vessels: current.vessels.map((vessel) =>
      vessel.id === payload.id
        ? {
            ...vessel,
            name: payload.name,
            imoNumber: payload.imoNumber,
            description: payload.description,
          }
        : vessel
    ),
  }));
};

const deleteVessel = (vesselId: string) => {
  setFleet((current) => ({
    vessels: current.vessels.filter((vessel) => vessel.id !== vesselId),
  }));
};

const editMachine = (payload: {
  vesselId: string;
  machineId: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  tasks: MaintenanceTask[];
}) => {
  setFleet((current) => ({
    vessels: current.vessels.map((vessel) => {
      if (vessel.id !== payload.vesselId) return vessel;

      return {
        ...vessel,
        machines: vessel.machines.map((plan) =>
          plan.machine.id === payload.machineId
            ? {
                ...plan,
                machine: {
                  ...plan.machine,
                  location: payload.location,
                  tag: payload.tag,
                  model: payload.model,
                  serialNumber: payload.serialNumber,
                  type: payload.type,
                },
                tasks: payload.tasks,
              }
            : plan
        ),
      };
    }),
  }));
};

const deleteMachine = (payload: { vesselId: string; machineId: string }) => {
  setFleet((current) => ({
    vessels: current.vessels.map((vessel) => {
      if (vessel.id !== payload.vesselId) return vessel;

      return {
        ...vessel,
        machines: vessel.machines.filter(
          (plan) => plan.machine.id !== payload.machineId
        ),
      };
    }),
  }));
};

  return (
    <AppShell
      vessels={fleet.vessels}
      addMenuOpen={addMenuOpen}
      addVesselOpen={addVesselOpen}
      addMachineOpen={addMachineOpen}
      onOpenAddMenu={() => setAddMenuOpen(true)}
      onCloseAddMenu={() => setAddMenuOpen(false)}
      onOpenAddVessel={() => {
        setAddMenuOpen(false);
        setAddVesselOpen(true);
      }}
      onOpenAddMachine={() => {
        setAddMenuOpen(false);
        setAddMachineOpen(true);
      }}
      onCloseAddVessel={() => setAddVesselOpen(false)}
      onCloseAddMachine={() => setAddMachineOpen(false)}
      onAddVessel={addVessel}
      onAddMachine={addMachine}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/vessels" replace />} />
        <Route path="/vessels" element={<VesselsPage vessels={fleet.vessels} onEditVessel={editVessel} onDeleteVessel={deleteVessel} />} />
        <Route path="/machines" element={<MachinesPage vessels={fleet.vessels} onEditMachine={editMachine} onDeleteMachine={deleteMachine} />} />
        <Route path="/add" element={<Navigate to="/vessels" replace />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/vessels/:vesselId/machines" element={<ShipMachinesPage vessels={fleet.vessels} />} />
        <Route
          path="/vessels/:vesselId/machines/:machineId"
          element={
            <MachineDetailRoute
              fleet={fleet}
              search={search}
              pendingOnly={pendingOnly}
              onSearchChange={setSearch}
              onTogglePendingOnly={() => setPendingOnly((value) => !value)}
              onUpdateTask={updateTask}
              onUpdateMachineField={updateMachineField}
            />
          }
        />
        <Route
          path="*"
          element={
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="text-slate-900">Page not found.</div>
              <button
                type="button"
                onClick={() => {
                  resetFleet();
                  setFleet(loadFleet());
                }}
                className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200"
              >
                Reset local data
              </button>
            </section>
          }
        />
      </Routes>
    </AppShell>
  );
}