import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { loadFleet, resetFleet, saveFleet } from "./storage/maintenanceStorage";
import {
  type FleetData,
  type MachineMeta,
  type MaintenanceReport,
  type MaintenanceTask,
  type NewMachinePayload,
  type NewVesselPayload,
} from "./types/maintenance";
import { VesselsPage } from "./pages/VesselsPage";
import { ShipMachinesPage } from "./pages/ShipMachinesPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
import { SyncPage } from "./pages/SyncPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { createId } from "./utils/createId";

function MachineDetailRoute({
  fleet,
  search,
  pendingOnly,
  onSearchChange,
  onTogglePendingOnly,
  onUpdateTask,
  onUpdateMachineField,
  onFinishMaintenance,
}: {
  fleet: FleetData;
  search: string;
  pendingOnly: boolean;
  onSearchChange: (value: string) => void;
  onTogglePendingOnly: () => void;
  onUpdateTask: (vesselId: string, machineId: string, task: MaintenanceTask) => void;
  onUpdateMachineField: (
    vesselId: string,
    machineId: string,
    field: keyof MachineMeta,
    value: string
  ) => void;
  onFinishMaintenance: (vesselId: string, machineId: string) => void;
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
      onUpdateMachineField={(field, value) =>
        onUpdateMachineField(vesselId, machineId, field, value)
      }
      onFinishMaintenance={onFinishMaintenance}
    />
  );
}

function MachineDetailRouteWithNavigation(props: {
  fleet: FleetData;
  search: string;
  pendingOnly: boolean;
  onSearchChange: (value: string) => void;
  onTogglePendingOnly: () => void;
  onUpdateTask: (vesselId: string, machineId: string, task: MaintenanceTask) => void;
  onUpdateMachineField: (
    vesselId: string,
    machineId: string,
    field: keyof MachineMeta,
    value: string
  ) => void;
  onCreateReport: (vesselId: string, machineId: string) => string | null;
}) {
  const navigate = useNavigate();

  return (
    <MachineDetailRoute
      {...props}
      onFinishMaintenance={(vesselId, machineId) => {
        const reportId = props.onCreateReport(vesselId, machineId);
        if (reportId) {
          navigate(`/reports/${reportId}`);
        }
      }}
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
      ...current,
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
  };

  const editVessel = (payload: {
    id: string;
    name: string;
    imoNumber: string;
    description: string;
  }) => {
    setFleet((current) => ({
      ...current,
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
      ...current,
      vessels: current.vessels.filter((vessel) => vessel.id !== vesselId),
      reports: current.reports.filter((report) => report.vesselId !== vesselId),
    }));
  };

  const addMachine = (payload: NewMachinePayload) => {
    setFleet((current) => ({
      ...current,
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
              tasks: [],
            },
          ],
        };
      }),
    }));
  };

  const updateTask = (vesselId: string, machineId: string, task: MaintenanceTask) => {
    setFleet((current) => ({
      ...current,
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

  const updateMachineField = (
    vesselId: string,
    machineId: string,
    field: keyof MachineMeta,
    value: string
  ) => {
    setFleet((current) => ({
      ...current,
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

  const createReport = (vesselId: string, machineId: string) => {
  const vessel = fleet.vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  if (!vessel || !plan) return null;

  const faultCount = plan.tasks.filter((task) => task.status === "fault").length;

  const report: MaintenanceReport = {
    id: createId(),
    vesselId: vessel.id,
    vesselName: vessel.name,
    machineId: plan.machine.id,
    machineTag: plan.machine.tag,
    machineModel: plan.machine.model,
    machineType: plan.machine.type,
    machineLocation: plan.machine.location,
    completedAt: new Date().toISOString(),
    overallStatus: faultCount > 0 ? "down" : "online",
    downtimeReason: plan.machine.downtimeReason || "",
    tasks: plan.tasks.map((task) => ({ ...task })),
  };

  const resetTasks = plan.tasks.map((task) => ({
    ...task,
    checked: false,
    status: "pending" as const,
    notes: "",
    measuredValue: "",
    completedAt: undefined,
  }));

  setFleet((current) => ({
    ...current,
    reports: [report, ...current.reports],
    vessels: current.vessels.map((currentVessel) => {
      if (currentVessel.id !== vesselId) return currentVessel;

      return {
        ...currentVessel,
        machines: currentVessel.machines.map((currentPlan) => {
          if (currentPlan.machine.id !== machineId) return currentPlan;

          return {
            ...currentPlan,
            machine: {
              ...currentPlan.machine,
              operatingStatus: "online",
              downtimeReason: "",
            },
            tasks: resetTasks,
          };
        }),
      };
    }),
  }));

  return report.id;
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
    ...current,
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
    ...current,
    vessels: current.vessels.map((vessel) => {
      if (vessel.id !== payload.vesselId) return vessel;

      return {
        ...vessel,
        machines: vessel.machines.filter(
          (plan) => plan.machine.id !== payload.machineId
        ),
      };
    }),
    reports: current.reports.filter(
      (report) => report.machineId !== payload.machineId
    ),
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
        <Route
          path="/vessels"
          element={
            <VesselsPage
              vessels={fleet.vessels}
              onEditVessel={editVessel}
              onDeleteVessel={deleteVessel}
            />
          }
        />
        <Route path="/machines" element={<MachinesPage vessels={fleet.vessels}
      onEditMachine={editMachine}
      onDeleteMachine={deleteMachine}/>} />
        <Route path="/add" element={<Navigate to="/vessels" replace />} />
        <Route path="/sync" element={<SyncPage />} />
        <Route
          path="/reports"
          element={<ReportsPage vessels={fleet.vessels} reports={fleet.reports} />}
        />
        <Route
          path="/reports/:reportId"
          element={<ReportDetailPage reports={fleet.reports} />}
        />
        <Route
          path="/vessels/:vesselId/machines"
          element={<ShipMachinesPage vessels={fleet.vessels} />}
        />
        <Route
          path="/vessels/:vesselId/machines/:machineId"
          element={
            <MachineDetailRouteWithNavigation
              fleet={fleet}
              search={search}
              pendingOnly={pendingOnly}
              onSearchChange={setSearch}
              onTogglePendingOnly={() => setPendingOnly((value) => !value)}
              onUpdateTask={updateTask}
              onUpdateMachineField={updateMachineField}
              onCreateReport={createReport}
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