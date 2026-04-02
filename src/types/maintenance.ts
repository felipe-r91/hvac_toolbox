export type TaskCategory =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Semi-Annual"
  | "Annual"
  | "2-Year / Shipyard"
  | "Startup"
  | "Operational"
  | "Off-limit Operation"
  | "VSD Maintenance"
  | "EM Starter Maintenance"
  | "SSS Maintenance"
  | "Brine System"
  | "Cargo Fans/Dampers"
  | "Pneumatic"
  | "Sensors"
  | "Shutdown/Idle"
  | "Fault-finding";

export type TaskStatus =
  | "pending"
  | "ok"
  | "attention"
  | "fault"
  | "not-applicable"
  | "skipped";

export type FailureComponent =
  | "Compressor"
  | "Starter"
  | "Oil-System"
  | "Refrigerant-Circuit"
  | "Sensor"
  | "Water-Flow"
  | "Controls"
  | "Mechanical"
  | "other";

export type FailureMode =
  | "Trip"
  | "Overheating"
  | "High-Pressure"
  | "Low-Pressure"
  | "Low-Oil-Pressure"
  | "Electrical-Fault"
  | "Sensor-Fault"
  | "Leak"
  | "Seized"
  | "Communication-Fault"
  | "other";


export type MachineMeta = {
  id: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
  operatingStatus?: "online" | "down";
  downtimeReason?: string;
  failureComponent?: FailureComponent;
  failureMode?: FailureMode;
  failureNotes?: string;
};

export type MaintenanceTask = {
  id: string;
  category: TaskCategory;
  task: string;
  tool?: string;
  checked: boolean;
  status: TaskStatus;
  notes: string;
  measuredValue: string;
  unit?: string;
  photoIds?: string[];
  completedAt?: string;
};

export type MachinePlan = {
  machine: MachineMeta;
  tasks: MaintenanceTask[];
};

export type Vessel = {
  id: string;
  name: string;
  imoNumber: string;
  description?: string;
  machines: MachinePlan[];
};

export type NewVesselPayload = {
  name: string;
  imoNumber: string;
  description: string;
};

export type NewMachinePayload = {
  vesselId: string;
  location: string;
  tag: string;
  model: string;
  serialNumber: string;
  type: string;
  starterType: string;
};

export type MaintenanceReport = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  machineModel: string;
  machineSerialNumber: string;
  machineType: string;
  machineLocation: string;
  completedAt: string;
  machineStarterType: string;
  overallStatus: "online" | "down";
  downtimeReason?: string;
  failureComponent?: FailureComponent;
  failureMode?: FailureMode;
  failureNotes?: string;
  tasks: MaintenanceTask[];
  faultCount?: number;
  machinePhotoIds?: string[];
  skippedCount?: number;
  synced?: boolean;
};

export type FleetData = {
  vessels: Vessel[];
  reports: MaintenanceReport[];
  photos: PhotoRecord[];
  correctiveDrafts: CorrectiveDraft[];
};

export type PhotoRecord = {
  id: string;
  machineId: string;
  reportId?: string;
  taskId?: string;
  kind: "machine" | "task";
  filename: string;
  mimeType: string;
  createdAt: string;
  required: boolean;
  synced: boolean;
  previewUrl?: string;
  blobStored?: boolean;
  remotePhotoId?: string;
};

export type CorrectivePhoto = {
  id: string;
  previewUrl?: string;
  filename: string;
  caption: string;
  file?: File;
  createdAt: string;
  blobStored?: boolean;
  remotePhotoId?: string;
};

export type CorrectiveDraft = {
  id: string;
  vesselId: string;
  vesselName: string;
  machineId: string;
  machineTag: string;
  machineModel: string;
  machineType: string;
  machineStarterType: string;
  machineLocation: string;
  createdAt: string;

  problemSummary: string;
  conditionFound: string;
  symptomsObserved: string;
  alarmsObserved: string;
  operationalImpact: string;

  preliminaryDiagnosis: string;
  confirmedCause: string;

  correctiveAction: string;
  recommendations: string;
  furtherActionRequired: string;

  machineReturnedToService: "yes" | "no" | "unknown";

  photos: CorrectivePhoto[];
  synced?: boolean;
};

export type UploadedPhotoRecord = {
  id: string;
  ownerType: "CORRECTIVE_DRAFT" | "PREVENTIVE_MACHINE" | "PREVENTIVE_TASK";
  ownerId: string;
  machineId: string;
  taskId?: string;
  filename: string;
  caption: string;
  createdAt: string;
  previewUrl?: string;
};

export type FleetSyncPayload = {
  vessels: {
    id: string;
    name: string;
    imoNumber: string;
    description: string;
    machines: {
      id: string;
      location: string;
      tag: string;
      model: string;
      serialNumber: string;
      type: string;
      starterType: string;
    }[];
  }[];
};