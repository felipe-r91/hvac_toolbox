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
  refrigerant?: string;
  oilType?: string;
  controlSystem?: string;
  softwareVersion?: string;
  compressorType?: string;
  mfg?: string;
  machinePhotoId?: string;
  machinePhotoPreviewUrl?: string;
};

type BackendVessel = {
  id: string;
  name: string;
  imoNumber: string;
  vesselType?: string;
  ownerCustomer?: string;
  ownerCostumer?: string;
  vesselContact?: string;
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
  const resolveBackendPhotoUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
  };

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
    vesselType: vessel.vesselType || "",
    ownerCustomer: vessel.ownerCustomer || vessel.ownerCostumer || "",
    vesselContact: vessel.vesselContact || "",
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
          refrigerant: machine.refrigerant || "",
          oilType: machine.oilType || "",
          controlSystem: machine.controlSystem || "",
          softwareVersion: machine.softwareVersion || "",
          compressorType: machine.compressorType || "",
          mfg: machine.mfg || "",
          operatingStatus: "online",
          downtimeReason: "",
          failureComponent: undefined,
          failureMode: undefined,
          failureCode: undefined,
          failureNotes: "",

          machinePhotoId: machine.machinePhotoId,
          machinePhotoPreviewUrl: resolveBackendPhotoUrl(machine.machinePhotoPreviewUrl),
          machinePhotoRemoteId: machine.machinePhotoId,
          machinePhotoBlobStored: false,
        },
        tasks: entry?.tasks || [],
      };
    }),
  }));
}
