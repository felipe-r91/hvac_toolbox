import { API_BASE_URL } from "./config";
import type { MaintenanceTask, Vessel } from "../types/maintenance";
import { createTasksFromModel } from "../data/maintenancePlanLibrary";

type BackendMachine = {
  id: string;
  vesselId: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
};

type BackendVessel = {
  id: string;
  name: string;
  imoNumber: string;
  description?: string;
  machines: BackendMachine[];
};

type BackendPlanTask = {
  id: string;
  category: MaintenanceTask["category"];
  task: string;
  tool?: string;
  checked?: boolean;
  status?: MaintenanceTask["status"];
  notes?: string;
  measuredValue?: string;
  unit?: string;
  required?: boolean;
  measurable?: boolean;
  photoRequiredOnFault?: boolean;
  photoRequiredOnAttention?: boolean;
};

type BackendMachinePlanResponse = {
  machine: BackendMachine;
  tasks: BackendPlanTask[];
};

export async function getFleetVessels(): Promise<BackendVessel[]> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/vessels`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load fleet vessels: ${text}`);
  }

  return response.json();
}

export async function getMachinePlan(machineId: string): Promise<BackendMachinePlanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/fleet/machines/${machineId}/plan`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load machine plan ${machineId}: ${text}`);
  }

  return response.json();
}

function mapTask(task: BackendPlanTask): MaintenanceTask {
  return {
    id: task.id,
    category: task.category,
    task: task.task,
    tool: task.tool || "",
    checked: false,
    status: "pending",
    notes: "",
    measuredValue: "",
    unit: task.unit,
    completedAt: undefined,
    photoIds: [],
  };
}

export async function downloadFleetRegistry(): Promise<Vessel[]> {
  const vessels = await getFleetVessels();

  const machinePlanEntries = await Promise.all(
    vessels.flatMap((vessel) =>
      vessel.machines.map(async (machine) => {
        let backendTasks: MaintenanceTask[] = [];

        try {
          const plan = await getMachinePlan(machine.id);
          backendTasks = plan.tasks.map(mapTask);
        } catch (error) {
          console.warn(`Failed to load backend plan for machine ${machine.id}`, error);
        }

        const fallbackTasks =
          backendTasks.length > 0
            ? backendTasks
            : createTasksFromModel(machine.model, machine.starterType);

        return {
          vesselId: vessel.id,
          machineId: machine.id,
          machine,
          tasks: fallbackTasks,
        };
      })
    )
  );

  const plansByMachineId = new Map(
    machinePlanEntries.map((entry) => [entry.machineId, entry])
  );

  return vessels.map((vessel) => ({
    id: vessel.id,
    name: vessel.name,
    imoNumber: vessel.imoNumber,
    description: vessel.description || "",
    machines: vessel.machines.map((machine) => {
      const entry = plansByMachineId.get(machine.id);

      return {
        machine: {
          id: machine.id,
          location: machine.location,
          tag: machine.tag,
          model: machine.model,
          serialNumber: machine.serialNumber,
          type: machine.type,
          starterType: machine.starterType,
          operatingStatus: "online",
          downtimeReason: "",
          failureComponent: undefined,
          failureMode: undefined,
          failureCode: undefined,
          failureNotes: "",
        },
        tasks: entry?.tasks || [],
      };
    }),
  }));
}