import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { loadFleet, resetFleet, saveFleet } from "./storage/maintenanceStorage";
import { downloadFleetRegistry } from "./api/fleetRegistryApi";
import { mergeFleetRegistry } from "./utils/mergeFleetRegistry";
import {
  type FleetData,
  type MachineMeta,
  type MaintenanceReport,
  type MaintenanceTask,
  type NewMachinePayload,
  type NewVesselPayload,
  type CorrectiveDraft,
  type UploadedPhotoRecord,
  type FleetSyncPayload,
  type FinishMaintenanceResult,
  type CorrectivePhoto,
  type CfrDraft,
} from "./types/maintenance";
import { VesselsPage } from "./pages/VesselsPage";
import { ShipMachinesPage } from "./pages/ShipMachinesPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { CfrReportPage } from "./pages/CfrReportPage";
import { createId } from "./utils/createId";
import { createTasksFromModel } from "./data/maintenancePlanLibrary";
import { CorrectiveMaintenancePage } from "./pages/CorrectiveMaintenancePage";
import { CorrectiveReportDetailPage } from "./pages/CorrectiveReportDetailPage";
import { MachineViewPage } from "./pages/MachineViewPage";
import { compressImageFile } from "./utils/imageCompression";
import { savePhotoBlob, getPhotoBlob, deletePhotoBlob } from "./storage/photoDb";
import { SyncPage, type SyncProgressInfo } from "./pages/SyncPage";
import { API_BASE_URL } from "./api/config";
import { getMaintenanceTemplateLibrary } from "./api/maintenanceTemplateApi";
import {
  saveMaintenanceTemplateLibrary,
  type StoredMaintenanceTemplateLibrary,
} from "./storage/maintenanceTemplateStorage";
import {
  loadOfflineSyncMetadata,
  updateOfflineSyncMetadata,
} from "./storage/offlineSyncStorage";
import { resolvePhotoUrl } from "./utils/photoUrl";
import { CfrReportDetailPage } from "./pages/CfrReportDetailPage";

function MachineDetailRoute({
  fleet,
  search,
  pendingOnly,
  onSearchChange,
  onTogglePendingOnly,
  onUpdateTask,
  onUpdateMachineField,
  onAddMachinePhoto,
  onAddTaskPhoto,
  onDeleteMachinePhoto,
  onDeleteTaskPhoto,
  getMachinePhotoCount,
  getTaskPhotoCount,
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
  onAddMachinePhoto: (machineId: string, file: File) => void;
  onAddTaskPhoto: (machineId: string, taskId: string, file: File) => void;
  onDeleteMachinePhoto: (machineId: string, previewUrl: string) => void;
  onDeleteTaskPhoto: (taskId: string, previewUrl: string) => void;
  getMachinePhotoCount: (machineId: string) => number;
  getTaskPhotoCount: (taskId: string) => number;
  onFinishMaintenance: (vesselId: string, machineId: string) => void;
}) {
  const { vesselId = "", machineId = "" } = useParams();

  const getMachinePhotoUrls = (currentMachineId: string) =>
    fleet.photos
      .filter((photo) => photo.machineId === currentMachineId && photo.kind === "machine")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((photo) => resolvePhotoUrl(photo))
      .filter((url): url is string => Boolean(url));

  const getTaskPhotoUrls = (currentTaskId: string) =>
    fleet.photos
      .filter(
        (photo) =>
          photo.machineId === machineId &&
          photo.taskId === currentTaskId &&
          photo.kind === "task"
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((photo) => resolvePhotoUrl(photo))
      .filter((url): url is string => Boolean(url));

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
      onAddMachinePhoto={onAddMachinePhoto}
      onAddTaskPhoto={(taskId, file) => onAddTaskPhoto(machineId, taskId, file)}
      getMachinePhotoCount={getMachinePhotoCount}
      getTaskPhotoCount={getTaskPhotoCount}
      getMachinePhotoUrls={getMachinePhotoUrls}
      getTaskPhotoUrls={getTaskPhotoUrls}
      onDeleteMachinePhoto={(previewUrl) => onDeleteMachinePhoto(machineId, previewUrl)}
      onDeleteTaskPhoto={(taskId, previewUrl) => onDeleteTaskPhoto(taskId, previewUrl)}
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
  onCreateReport: (vesselId: string, machineId: string) => Promise<FinishMaintenanceResult | null>;
  onAddMachinePhoto: (machineId: string, file: File) => void;
  onAddTaskPhoto: (machineId: string, taskId: string, file: File) => void;
  onDeleteMachinePhoto: (machineId: string, previewUrl: string) => void;
  onDeleteTaskPhoto: (taskId: string, previewUrl: string) => void;
  getMachinePhotoCount: (machineId: string) => number;
  getTaskPhotoCount: (taskId: string) => number;
}) {
  const navigate = useNavigate();

  return (
    <MachineDetailRoute
      {...props}
      onFinishMaintenance={async (vesselId, machineId) => {
        const result = await props.onCreateReport(vesselId, machineId);

        if (!result) return;

        if (result.redirectedTo === "corrective" && result.linkedCorrectiveDraftId) {
          alert("Machine marked as down. A linked corrective report was created automatically.");
          navigate(`/corrective-reports/${result.linkedCorrectiveDraftId}`);
          return;
        }

        navigate(`/reports/${result.reportId}`);
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
  const [fleetSyncLoading, setFleetSyncLoading] = useState(false);
  const [fleetSyncError, setFleetSyncError] = useState("");
  const [fleetSyncSuccessMessage, setFleetSyncSuccessMessage] = useState("");
  const [templateSyncLoading, setTemplateSyncLoading] = useState(false);
  const [templateSyncError, setTemplateSyncError] = useState("");
  const [templateSyncSuccessMessage, setTemplateSyncSuccessMessage] = useState("");
  const [offlineSyncMetadata, setOfflineSyncMetadata] = useState(() => loadOfflineSyncMetadata());

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
      correctiveDrafts: current.correctiveDrafts.filter(
        (draft) => draft.vesselId !== vesselId
      ),
      cfrDrafts: current.cfrDrafts.filter((draft) => draft.vesselId !== vesselId),
      photos: current.photos.filter((photo) => {
        const vessel = current.vessels.find((item) => item.id === vesselId);
        const machineIds = vessel?.machines.map((plan) => plan.machine.id) || [];
        return !machineIds.includes(photo.machineId);
      }),
    }));
  };

  const addMachine = (payload: NewMachinePayload) => {
    const tasks = createTasksFromModel(payload.model, payload.starterType);

    if (tasks.length === 0) {
      alert(
        "Maintenance templates are not available offline yet.\n\nPlease sync the fleet data before creating a new machine."
      );
      return;
    }

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
                starterType: payload.starterType,
                operatingStatus: "online",
                downtimeReason: "",
                failureComponent: undefined,
                failureCode: undefined,
                failureMode: undefined,
                failureNotes: "",
              },
              tasks,
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

  const addMachinePhoto = async (machineId: string, file: File) => {
    const compressedFile = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      mimeType: "image/jpeg",
    });

    const photoId = createId();
    const previewUrl = URL.createObjectURL(compressedFile);

    await savePhotoBlob({
      id: photoId,
      blob: compressedFile,
      filename: compressedFile.name,
      mimeType: compressedFile.type,
      createdAt: new Date().toISOString(),
    });

    setFleet((current) => ({
      ...current,
      photos: [
        ...current.photos.filter(
          (photo) => !(photo.machineId === machineId && photo.kind === "machine")
        ),
        {
          id: photoId,
          machineId,
          kind: "machine",
          filename: compressedFile.name,
          mimeType: compressedFile.type,
          createdAt: new Date().toISOString(),
          required: true,
          synced: false,
          previewUrl,
          blobStored: true,
        },
      ],
    }));
  };

  const addTaskPhoto = async (machineId: string, taskId: string, file: File) => {
    const compressedFile = await compressImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.78,
      mimeType: "image/jpeg",
    });

    const photoId = createId();
    const previewUrl = URL.createObjectURL(compressedFile);

    await savePhotoBlob({
      id: photoId,
      blob: compressedFile,
      filename: compressedFile.name,
      mimeType: compressedFile.type,
      createdAt: new Date().toISOString(),
    });

    setFleet((current) => ({
      ...current,
      photos: [
        ...current.photos,
        {
          id: photoId,
          machineId,
          taskId,
          kind: "task",
          filename: compressedFile.name,
          mimeType: compressedFile.type,
          createdAt: new Date().toISOString(),
          required: true,
          synced: false,
          previewUrl,
          blobStored: true,
        },
      ],
      vessels: current.vessels.map((vessel) => ({
        ...vessel,
        machines: vessel.machines.map((plan) => ({
          ...plan,
          tasks: plan.tasks.map((task) =>
            task.id === taskId
              ? {
                ...task,
                photoIds: [...(task.photoIds || []), photoId],
              }
              : task
          ),
        })),
      })),
    }));
  };

  const deleteMachinePhoto = (machineId: string, previewUrl: string) => {

    const photoToDelete = fleet.photos.find((photo) => photo.previewUrl === previewUrl)

    if (!photoToDelete) return;
    deletePhotoBlob(photoToDelete.id)

    setFleet((current) => ({
      ...current,
      photos: current.photos.filter(
        (photo) =>
          !(
            photo.machineId === machineId &&
            photo.kind === "machine" &&
            photo.previewUrl === previewUrl
          )
      ),
    }));
  };

  const deleteTaskPhoto = (taskId: string, previewUrl: string) => {
    const photoToDelete = fleet.photos.find(
      (photo) =>
        photo.taskId === taskId &&
        photo.kind === "task" &&
        photo.previewUrl === previewUrl
    );

    if (!photoToDelete) return;
    deletePhotoBlob(photoToDelete.id)

    setFleet((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.id !== photoToDelete.id),
      vessels: current.vessels.map((vessel) => ({
        ...vessel,
        machines: vessel.machines.map((plan) => ({
          ...plan,
          tasks: plan.tasks.map((task) =>
            task.id === taskId
              ? {
                ...task,
                photoIds: (task.photoIds || []).filter((id) => id !== photoToDelete.id),
              }
              : task
          ),
        })),
      })),
    }));
  };

  const getMachinePhotoCount = (machineId: string) =>
    fleet.photos.filter((photo) => photo.machineId === machineId && photo.kind === "machine")
      .length;

  const getTaskPhotoCount = (taskId: string) =>
    fleet.photos.filter((photo) => photo.taskId === taskId && photo.kind === "task").length;

  const createReport = async (vesselId: string, machineId: string): Promise<FinishMaintenanceResult | null> => {
    const vessel = fleet.vessels.find((item) => item.id === vesselId);
    const plan = vessel?.machines.find((item) => item.machine.id === machineId);

    if (!vessel || !plan) return null;

    const completedAt = new Date().toISOString();
    const reportId = createId();
    const shouldCreateCorrective = plan.machine.operatingStatus === "down";
    const correctiveDraftId = shouldCreateCorrective ? createId() : undefined;

    const faultCount = plan.tasks.filter((task) => task.status === "fault").length;
    const skippedCount = plan.tasks.filter((task) => task.status === "skipped").length;

    const machinePhotos = fleet.photos.filter(
      (photo) => photo.machineId === plan.machine.id && photo.kind === "machine"
    );

    const duplicatedCorrectivePhotos: CorrectivePhoto[] = [];

    if (shouldCreateCorrective) {
      for (const photo of machinePhotos) {
        const originalBlob = await getPhotoBlob(photo.id);

        if (!originalBlob) {
          console.warn(`Machine photo blob not found for duplication: ${photo.id}`);
          continue;
        }

        const duplicatedPhotoId = createId();

        await savePhotoBlob({
          id: duplicatedPhotoId,
          blob: originalBlob.blob,
          filename: originalBlob.filename,
          mimeType: originalBlob.mimeType,
          createdAt: new Date().toISOString(),
        });

        duplicatedCorrectivePhotos.push({
          id: duplicatedPhotoId,
          filename: originalBlob.filename,
          caption: "Photo captured during preventive maintenance",
          createdAt: new Date().toISOString(),
          previewUrl: photo.previewUrl,
          blobStored: true,
        });
      }
    }

    const machinePhotoIds = machinePhotos.map((photo) => photo.id);

    const taskPhotoIds = plan.tasks.flatMap((task) => task.photoIds || []);

    const report: MaintenanceReport = {
      id: reportId,
      vesselId: vessel.id,
      vesselName: vessel.name,
      machineId: plan.machine.id,
      machineTag: plan.machine.tag,
      machineSerialNumber: plan.machine.serialNumber,
      machineModel: plan.machine.model,
      machineType: plan.machine.type,
      machineLocation: plan.machine.location,
      machineStarterType: plan.machine.starterType,
      completedAt,
      overallStatus: plan.machine.operatingStatus === "down" ? "down" : "online",
      reportCategory: "health_check",
      downtimeReason: plan.machine.downtimeReason || "",
      failureComponent: plan.machine.failureComponent,
      failureMode: plan.machine.failureMode,
      failureCode: plan.machine.failureCode,
      failureNotes: plan.machine.failureNotes || "",
      faultCount,
      skippedCount,
      machinePhotoIds,
      tasks: plan.tasks.map((task) => ({ ...task })),
      synced: false,
      linkedCorrectiveDraftId: correctiveDraftId,
    };

    const linkedCorrectiveDraft: CorrectiveDraft | null = shouldCreateCorrective
      ? {
        id: correctiveDraftId!,
        vesselId: vessel.id,
        vesselName: vessel.name,
        machineId: plan.machine.id,
        machineTag: plan.machine.tag,
        machineModel: plan.machine.model,
        machineType: plan.machine.type,
        machineStarterType: plan.machine.starterType,
        machineLocation: plan.machine.location,
        createdAt: completedAt,

        reportCategory: "corrective",

        failureComponent: plan.machine.failureComponent,
        failureMode: plan.machine.failureMode,
        failureCode: plan.machine.failureCode,

        problemSummary:
          plan.machine.failureNotes?.trim() ||
          plan.machine.downtimeReason?.trim() ||
          `${plan.machine.tag} found down during preventive maintenance.`,

        conditionFound:
          plan.machine.failureNotes?.trim() ||
          plan.machine.downtimeReason?.trim() ||
          "Failure detected during preventive maintenance visit.",

        symptomsObserved: plan.tasks
          .filter((task) => task.status === "fault" || task.status === "attention")
          .map((task) => {
            const note = task.notes?.trim();
            return note ? `${task.task}: ${note}` : task.task;
          })
          .join("\n"),

        alarmsObserved: "",
        operationalImpact:
          plan.machine.downtimeReason?.trim() || "Machine unavailable for normal operation.",

        preliminaryDiagnosis: "",
        confirmedCause: "",
        correctiveAction: "",
        recommendations: "",
        furtherActionRequired: "",

        machineReturnedToService: "no",
        photos: duplicatedCorrectivePhotos,
        synced: false,
        sourcePreventiveReportId: reportId,
      }
      : null;

    const resetTasks = plan.tasks.map((task) => ({
      ...task,
      checked: false,
      status: "pending" as const,
      notes: "",
      measuredValue: "",
      completedAt: undefined,
      photoIds: [],
    }));

    setFleet((current) => ({
      ...current,
      reports: [report, ...current.reports],
      correctiveDrafts: linkedCorrectiveDraft
        ? [linkedCorrectiveDraft, ...current.correctiveDrafts]
        : current.correctiveDrafts,
      photos: current.photos.map((photo) => {
        const isMachinePhotoForThisReport =
          photo.machineId === machineId &&
          photo.kind === "machine" &&
          machinePhotoIds.includes(photo.id);

        const isTaskPhotoForThisReport =
          photo.machineId === machineId &&
          photo.kind === "task" &&
          taskPhotoIds.includes(photo.id);

        if (isMachinePhotoForThisReport || isTaskPhotoForThisReport) {
          return {
            ...photo,
            reportId,
          };
        }

        return photo;
      }),
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
                failureComponent: undefined,
                failureMode: undefined,
                failureCode: undefined,
                failureNotes: "",
              },
              tasks: resetTasks,
            };
          }),
        };
      }),
    }));

    return {
      reportId,
      linkedCorrectiveDraftId: correctiveDraftId,
      redirectedTo: shouldCreateCorrective ? "corrective" : "health_check",
    };
  };

  const buildOfflineTasksForMachine = (model: string, starterType: string) => {
    const tasks = createTasksFromModel(model, starterType);

    if (tasks.length === 0) {
      alert(
        "Maintenance templates are not available offline yet.\n\nPlease sync offline data before creating or changing this machine."
      );
      return null;
    }

    return tasks;
  };

  const editMachine = (payload: {
    vesselId: string;
    machineId: string;
    location: string;
    tag: string;
    model: string;
    serialNumber: string;
    type: string;
    starterType: string;
    tasks: MaintenanceTask[];
  }) => {
    setFleet((current) => ({
      ...current,
      vessels: current.vessels.map((vessel) => {
        if (vessel.id !== payload.vesselId) return vessel;

        return {
          ...vessel,
          machines: vessel.machines.map((plan) => {
            if (plan.machine.id !== payload.machineId) return plan;

            const modelChanged = plan.machine.model !== payload.model;
            const starterChanged = plan.machine.starterType !== payload.starterType;

            let nextTasks = plan.tasks;

            if (modelChanged || starterChanged) {
              const regeneratedTasks = buildOfflineTasksForMachine(
                payload.model,
                payload.starterType
              );

              if (!regeneratedTasks) {
                return plan;
              }

              nextTasks = regeneratedTasks;
            }

            return {
              ...plan,
              machine: {
                ...plan.machine,
                location: payload.location,
                tag: payload.tag,
                model: payload.model,
                serialNumber: payload.serialNumber,
                type: payload.type,
                starterType: payload.starterType,
              },
              tasks: nextTasks,
            };
          }),
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
          machines: vessel.machines.filter((plan) => plan.machine.id !== payload.machineId),
        };
      }),
      reports: current.reports.filter((report) => report.machineId !== payload.machineId),
      correctiveDrafts: current.correctiveDrafts.filter(
        (draft) => draft.machineId !== payload.machineId
      ),
      cfrDrafts: current.cfrDrafts.filter(
        (draft) => draft.machineId !== payload.machineId
      ),
      photos: current.photos.filter((photo) => photo.machineId !== payload.machineId),
    }));
  };

  const saveCorrectiveDraft = (draft: CorrectiveDraft) => {
    const payload = {
      ...draft,
      synced: false,
    };

    setFleet((current) => {
      const existing = current.correctiveDrafts.find((item) => item.id === payload.id);

      return {
        ...current,
        correctiveDrafts: existing
          ? current.correctiveDrafts.map((item) =>
            item.id === payload.id ? payload : item
          )
          : [payload, ...current.correctiveDrafts],
      };
    });
  };

  const deleteCorrectiveDraft = (draftId: string) => {
    setFleet((current) => ({
      ...current,
      correctiveDrafts: current.correctiveDrafts.filter((item) => item.id !== draftId),
    }));
  };

  const getCorrectiveDraftByMachine = (machineId: string) => {
    return fleet.correctiveDrafts.find((item) => item.machineId === machineId) || null;
  };

  const reportProgress = (
    onProgress: ((info: SyncProgressInfo) => void) | undefined,
    percent: number,
    label: string
  ) => {
    onProgress?.({ percent, label });
  };

  const markReportSynced = (reportId: string) => {
    setFleet((current) => ({
      ...current,
      reports: current.reports.map((report) =>
        report.id === reportId ? { ...report, synced: true } : report
      ),
    }));
  };

  const markCorrectiveDraftSynced = (draftId: string) => {
    setFleet((current) => ({
      ...current,
      correctiveDrafts: current.correctiveDrafts.map((draft) =>
        draft.id === draftId ? { ...draft, synced: true } : draft
      ),
    }));
  };

  const markCfrDraftSynced = (draftId: string) => {
    setFleet((current) => ({
      ...current,
      cfrDrafts: current.cfrDrafts.map((draft) =>
        draft.id === draftId ? { ...draft, synced: true } : draft
      ),
    }));
  };

  const deletePreventiveReport = (reportId: string) => {
    setFleet((current) => ({
      ...current,
      reports: current.reports.filter((report) => report.id !== reportId),
    }));
  };

  const syncAllPendingItems = async (
    onProgress?: (info: SyncProgressInfo) => void
  ) => {
    const pendingReports = fleet.reports.filter((item) => !item.synced);
    const pendingCorrectiveDrafts = fleet.correctiveDrafts.filter(
      (item) => !item.synced
    );
    const pendingCfrDrafts = fleet.cfrDrafts.filter((item) => !item.synced);

    const totalItems =
      pendingReports.length +
      pendingCorrectiveDrafts.length +
      pendingCfrDrafts.length;

    try {
      reportProgress(onProgress, 5, "Syncing fleet master data...");
      await postFleetSync();

      if (totalItems === 0) {
        reportProgress(onProgress, 100, "Fleet data synced successfully.");
        alert("Fleet data synced successfully.");
        return;
      }

      let completedItems = 0;

      for (const report of pendingReports) {
        await syncPreventiveReport(report.id, (info) => {
          const itemBase = completedItems / totalItems;
          const itemWeight = 1 / totalItems;
          const overallPercent = Math.round(
            10 + (itemBase + (info.percent / 100) * itemWeight) * 90
          );

          reportProgress(onProgress, overallPercent, info.label);
        });

        completedItems += 1;
        reportProgress(
          onProgress,
          Math.round(10 + (completedItems / totalItems) * 90),
          `Completed ${completedItems} of ${totalItems} items...`
        );
      }

      for (const draft of pendingCorrectiveDrafts) {
        await syncCorrectiveDraft(draft.id, (info) => {
          const itemBase = completedItems / totalItems;
          const itemWeight = 1 / totalItems;
          const overallPercent = Math.round(
            10 + (itemBase + (info.percent / 100) * itemWeight) * 90
          );

          reportProgress(onProgress, overallPercent, info.label);
        });

        completedItems += 1;
        reportProgress(
          onProgress,
          Math.round(10 + (completedItems / totalItems) * 90),
          `Completed ${completedItems} of ${totalItems} items...`
        );
      }

      for (const draft of pendingCfrDrafts) {
        await syncCfrDraft(draft.id, (info) => {
          const itemBase = completedItems / totalItems;
          const itemWeight = 1 / totalItems;
          const overallPercent = Math.round(
            10 + (itemBase + (info.percent / 100) * itemWeight) * 90
          );

          reportProgress(onProgress, overallPercent, info.label);
        });

        completedItems += 1;
        reportProgress(
          onProgress,
          Math.round(10 + (completedItems / totalItems) * 90),
          `Completed ${completedItems} of ${totalItems} items...`
        );
      }

      reportProgress(onProgress, 100, "All pending items synced successfully.");
      alert("All pending items synced successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to sync all pending items.");
      throw error;
    }
  };

  const syncPreventiveReport = async (
    reportId: string,
    onProgress?: (info: SyncProgressInfo) => void
  ) => {
    const report = fleet.reports.find((item) => item.id === reportId);

    if (!report) {
      alert("Preventive report not found.");
      return;
    }

    try {
      reportProgress(onProgress, 5, `Syncing fleet data for ${report.machineTag}...`);
      await postFleetSync();

      reportProgress(onProgress, 10, `Sending preventive report for ${report.machineTag}...`);
      await postPreventiveReport(report);

      reportProgress(onProgress, 20, `Uploading machine photos for ${report.machineTag}...`);
      const uploadedMachinePhotos = await uploadPreventiveMachinePhotos(report, (percent, label) => {
        reportProgress(onProgress, 20 + Math.round(percent * 0.25), label);
      });

      reportProgress(onProgress, 50, `Uploading task photos for ${report.machineTag}...`);
      const uploadedTaskPhotos = await uploadPreventiveTaskPhotos(report, (percent, label) => {
        reportProgress(onProgress, 50 + Math.round(percent * 0.35), label);
      });

      reportProgress(onProgress, 90, `Cleaning local photo data for ${report.machineTag}...`);
      await cleanupPreventiveReportPhotos(report, {
        ...uploadedMachinePhotos,
        ...uploadedTaskPhotos,
      });

      markReportSynced(reportId);
      reportProgress(onProgress, 100, `Preventive report for ${report.machineTag} synced.`);

      alert("Preventive report synced successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to sync preventive report.");
      throw error;
    }
  };

  const syncCorrectiveDraft = async (
    draftId: string,
    onProgress?: (info: SyncProgressInfo) => void
  ) => {
    const draft = fleet.correctiveDrafts.find((item) => item.id === draftId);

    if (!draft) {
      alert("Corrective draft not found.");
      return;
    }

    try {
      reportProgress(onProgress, 5, `Syncing fleet data for ${draft.machineTag}...`);
      await postFleetSync();

      reportProgress(onProgress, 10, `Sending corrective draft for ${draft.machineTag}...`);
      await postCorrectiveDraft(draft);

      const totalPhotos = draft.photos.length;
      const uploadedPhotos: Record<
        string,
        { remotePhotoId: string; previewUrl?: string }
      > = {};

      if (totalPhotos === 0) {
        reportProgress(onProgress, 80, `No photos to upload for ${draft.machineTag}...`);
      } else {
        for (let index = 0; index < totalPhotos; index += 1) {
          const photo = draft.photos[index];

          const uploaded = await uploadPhotoRecord({
            ownerType: "CORRECTIVE_DRAFT",
            ownerId: draft.id,
            machineId: draft.machineId,
            caption: photo.caption,
            photoId: photo.id,
            onUploadProgress: (uploadPercent) => {
              const fileStart = index / totalPhotos;
              const fileSpan = 1 / totalPhotos;
              const overallPercent = Math.round(
                (0.15 + (fileStart + (uploadPercent / 100) * fileSpan) * 0.65) * 100
              );

              reportProgress(
                onProgress,
                overallPercent,
                `Uploading photo ${index + 1} of ${totalPhotos} for ${draft.machineTag}...`
              );
            },
          });

          uploadedPhotos[photo.id] = {
            remotePhotoId: uploaded.id,
            previewUrl: toAbsoluteApiUrl(uploaded.previewUrl),
          };
        }
      }

      reportProgress(onProgress, 90, `Cleaning local photo data for ${draft.machineTag}...`);
      await cleanupCorrectiveDraftPhotos(draft, uploadedPhotos);

      markCorrectiveDraftSynced(draftId);
      reportProgress(onProgress, 100, `Corrective draft for ${draft.machineTag} synced.`);

      alert("Corrective draft synced successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to sync corrective draft.");
      throw error;
    }
  };

  const syncCfrDraft = async (
    draftId: string,
    onProgress?: (info: SyncProgressInfo) => void
  ) => {
    const draft = fleet.cfrDrafts.find((item) => item.id === draftId);

    if (!draft) {
      alert("CFR draft not found.");
      return;
    }

    try {
      reportProgress(onProgress, 5, `Syncing fleet data for ${draft.machineTag}...`);
      await postFleetSync();

      reportProgress(onProgress, 10, `Sending CFR for ${draft.machineTag}...`);
      await postCfrDraft(draft);

      const totalPhotos = draft.photos.length;
      const uploadedPhotos: Record<
        string,
        { remotePhotoId: string; previewUrl?: string }
      > = {};

      if (totalPhotos === 0) {
        reportProgress(onProgress, 80, `No photos to upload for ${draft.machineTag}...`);
      } else {
        for (let index = 0; index < totalPhotos; index += 1) {
          const photo = draft.photos[index];

          const uploaded = await uploadPhotoRecord({
            ownerType: "CFR_DRAFT",
            ownerId: draft.id,
            machineId: draft.machineId,
            caption: photo.caption,
            photoId: photo.id,
            onUploadProgress: (uploadPercent) => {
              const fileStart = index / totalPhotos;
              const fileSpan = 1 / totalPhotos;
              const overallPercent = Math.round(
                (0.15 + (fileStart + (uploadPercent / 100) * fileSpan) * 0.65) * 100
              );

              reportProgress(
                onProgress,
                overallPercent,
                `Uploading photo ${index + 1} of ${totalPhotos} for ${draft.machineTag}...`
              );
            },
          });

          uploadedPhotos[photo.id] = {
            remotePhotoId: uploaded.id,
            previewUrl: toAbsoluteApiUrl(uploaded.previewUrl),
          };
        }
      }

      reportProgress(onProgress, 90, `Cleaning local photo data for ${draft.machineTag}...`);
      await cleanupCfrDraftPhotos(draft, uploadedPhotos);

      markCfrDraftSynced(draftId);
      reportProgress(onProgress, 100, `CFR for ${draft.machineTag} synced.`);

      alert("CFR synced successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to sync CFR.");
      throw error;
    }
  };

  const postCorrectiveDraft = async (draft: CorrectiveDraft) => {
    const payload = {
      ...draft,
      photos: draft.photos.map((photo) => ({
        id: photo.id,
        filename: photo.filename,
        caption: photo.caption,
        createdAt: photo.createdAt,
        previewUrl: `/api/photos/${photo.id}`,
      })),
    };

    const response = await fetch(`${API_BASE_URL}/api/sync/corrective`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Corrective sync failed: ${text}`);
    }

    return response.json();
  };

  const postPreventiveReport = async (report: MaintenanceReport) => {
    const response = await fetch(`${API_BASE_URL}/api/sync/preventive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Preventive sync failed: ${text}`);
    }

    return response.json();
  };

  const postCfrDraft = async (draft: CfrDraft) => {
    const payload = {
      ...draft,
      photos: draft.photos.map((photo) => ({
        id: photo.id,
        filename: photo.filename,
        caption: photo.caption,
        createdAt: photo.createdAt,
        previewUrl: `/api/photos/${photo.id}`,
      })),
    };

    const response = await fetch(`${API_BASE_URL}/api/sync/cfr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`CFR sync failed: ${text}`);
    }

    return response.json();
  };

  const uploadPhotoRecord = async ({
    ownerType,
    ownerId,
    machineId,
    taskId,
    caption,
    photoId,
    onUploadProgress,
  }: {
    ownerType: "CORRECTIVE_DRAFT" | "PREVENTIVE_MACHINE" | "PREVENTIVE_TASK" | "CFR_DRAFT";
    ownerId: string;
    machineId: string;
    taskId?: string;
    caption?: string;
    photoId: string;
    onUploadProgress?: (percent: number) => void;
  }) => {
    const stored = await getPhotoBlob(photoId);

    if (!stored) {
      throw new Error(`Photo blob not found in IndexedDB for photo ${photoId}`);
    }

    const file = new File([stored.blob], stored.filename, {
      type: stored.mimeType,
      lastModified: Date.now(),
    });

    const formData = new FormData();
    formData.append("ownerType", ownerType);
    formData.append("ownerId", ownerId);
    formData.append("machineId", machineId);

    if (taskId) {
      formData.append("taskId", taskId);
    }

    formData.append("caption", caption || "");
    formData.append("file", file);

    return new Promise<UploadedPhotoRecord>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${API_BASE_URL}/api/photos/upload`);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        onUploadProgress?.(percent);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Photo upload failed: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Photo upload failed due to a network error."));
      };

      xhr.send(formData);
    });
  };

  const uploadPreventiveMachinePhotos = async (
    report: MaintenanceReport,
    onProgress?: (percent: number, label: string) => void
  ) => {
    const machinePhotos = fleet.photos.filter(
      (photo) =>
        photo.reportId === report.id &&
        photo.machineId === report.machineId &&
        photo.kind === "machine" &&
        report.machinePhotoIds?.includes(photo.id)
    );

    const uploadedPhotos: Record<string, { remotePhotoId: string; previewUrl?: string }> = {};

    if (machinePhotos.length === 0) {
      onProgress?.(100, `No machine photos for ${report.machineTag}.`);
      return uploadedPhotos;
    }

    for (let index = 0; index < machinePhotos.length; index += 1) {
      const photo = machinePhotos[index];

      const uploaded = await uploadPhotoRecord({
        ownerType: "PREVENTIVE_MACHINE",
        ownerId: report.id,
        machineId: report.machineId,
        caption: "Machine identification photo",
        photoId: photo.id,
        onUploadProgress: (uploadPercent) => {
          const fileStart = (index / machinePhotos.length) * 100;
          const fileSpan = 100 / machinePhotos.length;
          const overallPercent = Math.round(
            fileStart + (uploadPercent / 100) * fileSpan
          );

          onProgress?.(
            overallPercent,
            `Uploading machine photo ${index + 1} of ${machinePhotos.length} for ${report.machineTag}...`
          );
        },
      });

      uploadedPhotos[photo.id] = {
        remotePhotoId: uploaded.id,
        previewUrl: toAbsoluteApiUrl(uploaded.previewUrl),
      };
    }

    return uploadedPhotos;
  };

  const uploadPreventiveTaskPhotos = async (
    report: MaintenanceReport,
    onProgress?: (percent: number, label: string) => void
  ) => {
    const taskPhotoJobs = report.tasks.flatMap((task) => {
      const taskPhotoIds = task.photoIds || [];
      if (taskPhotoIds.length === 0) return [];

      return fleet.photos
        .filter(
          (photo) =>
            photo.reportId === report.id &&
            photo.machineId === report.machineId &&
            photo.kind === "task" &&
            photo.taskId === task.id &&
            taskPhotoIds.includes(photo.id)
        )
        .map((photo) => ({
          task,
          photo,
        }));
    });

    const uploadedPhotos: Record<string, { remotePhotoId: string; previewUrl?: string }> = {};

    if (taskPhotoJobs.length === 0) {
      onProgress?.(100, `No task photos for ${report.machineTag}.`);
      return uploadedPhotos;
    }

    for (let index = 0; index < taskPhotoJobs.length; index += 1) {
      const { task, photo } = taskPhotoJobs[index];

      const uploaded = await uploadPhotoRecord({
        ownerType: "PREVENTIVE_TASK",
        ownerId: report.id,
        machineId: report.machineId,
        taskId: task.id,
        caption: task.task,
        photoId: photo.id,
        onUploadProgress: (uploadPercent) => {
          const fileStart = (index / taskPhotoJobs.length) * 100;
          const fileSpan = 100 / taskPhotoJobs.length;
          const overallPercent = Math.round(
            fileStart + (uploadPercent / 100) * fileSpan
          );

          onProgress?.(
            overallPercent,
            `Uploading task photo ${index + 1} of ${taskPhotoJobs.length} for ${report.machineTag}...`
          );
        },
      });

      uploadedPhotos[photo.id] = {
        remotePhotoId: uploaded.id,
        previewUrl: toAbsoluteApiUrl(uploaded.previewUrl),
      };
    }

    return uploadedPhotos;
  };

  const cleanupPreventiveReportPhotos = async (
    report: MaintenanceReport,
    uploadedPhotos: Record<string, { remotePhotoId: string; previewUrl?: string }>
  ) => {
    const relatedPhotos = fleet.photos.filter((photo) => photo.reportId === report.id);

    for (const photo of relatedPhotos) {
      await deletePhotoBlob(photo.id);
    }

    setFleet((current) => ({
      ...current,
      photos: current.photos.map((photo) => {
        if (photo.reportId !== report.id) {
          return photo;
        }

        return {
          ...photo,
          synced: true,
          blobStored: false,
          previewUrl: uploadedPhotos[photo.id]?.previewUrl ?? photo.previewUrl,
          remotePhotoId: uploadedPhotos[photo.id]?.remotePhotoId ?? photo.remotePhotoId,
        };
      }),
    }));
  };

  const cleanupCorrectiveDraftPhotos = async (
    draft: CorrectiveDraft,
    uploadedPhotos: Record<string, { remotePhotoId: string; previewUrl?: string }>
  ) => {
    for (const photo of draft.photos) {
      await deletePhotoBlob(photo.id);
    }

    setFleet((current) => ({
      ...current,
      correctiveDrafts: current.correctiveDrafts.map((item) =>
        item.id === draft.id
          ? {
            ...item,
            photos: item.photos.map((photo) => ({
              ...photo,
              previewUrl:
                uploadedPhotos[photo.id]?.previewUrl ?? photo.previewUrl,
              remotePhotoId:
                uploadedPhotos[photo.id]?.remotePhotoId ?? photo.remotePhotoId,
              blobStored: false,
              file: undefined,
            })),
          }
          : item
      ),
    }));
  };

  const cleanupCfrDraftPhotos = async (
    draft: CfrDraft,
    uploadedPhotos: Record<string, { remotePhotoId: string; previewUrl?: string }>
  ) => {
    for (const photo of draft.photos) {
      await deletePhotoBlob(photo.id);
    }

    setFleet((current) => ({
      ...current,
      cfrDrafts: current.cfrDrafts.map((item) =>
        item.id === draft.id
          ? {
            ...item,
            photos: item.photos.map((photo) => ({
              ...photo,
              previewUrl: uploadedPhotos[photo.id]?.previewUrl ?? photo.previewUrl,
              remotePhotoId: uploadedPhotos[photo.id]?.remotePhotoId ?? photo.remotePhotoId,
              blobStored: false,
              file: undefined,
            })),
          }
          : item
      ),
    }));
  };

  const toAbsoluteApiUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url}`;
  };

  const buildFleetSyncPayload = (fleet: FleetData): FleetSyncPayload => {
    return {
      vessels: fleet.vessels.map((vessel) => ({
        id: vessel.id,
        name: vessel.name,
        imoNumber: vessel.imoNumber,
        description: vessel.description || "",
        machines: vessel.machines.map((plan) => ({
          id: plan.machine.id,
          location: plan.machine.location,
          tag: plan.machine.tag,
          model: plan.machine.model,
          serialNumber: plan.machine.serialNumber,
          type: plan.machine.type,
          starterType: plan.machine.starterType,
        })),
      })),
    };
  };

  const postFleetSync = async () => {
    const payload = buildFleetSyncPayload(fleet);

    const response = await fetch(`${API_BASE_URL}/api/fleet/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Fleet sync failed: ${text}`);
    }
  };

  const syncFleetRegistry = async () => {
    try {
      setFleetSyncLoading(true);
      setFleetSyncError("");
      setFleetSyncSuccessMessage("");

      const remoteVessels = await downloadFleetRegistry();
      const syncedAt = new Date().toISOString();

      setFleet((current) => {
        const merged = mergeFleetRegistry(current, remoteVessels);
        saveFleet(merged);
        return merged;
      });

      updateOfflineSyncMetadata({ fleetRegistrySyncedAt: syncedAt });
      setOfflineSyncMetadata((current) => ({
        ...current,
        fleetRegistrySyncedAt: syncedAt,
      }));

      setFleetSyncSuccessMessage("Fleet registry synced successfully.");
    } catch (error) {
      console.error(error);
      setFleetSyncError("Failed to sync fleet registry.");
      throw error;
    } finally {
      setFleetSyncLoading(false);
    }
  };

  const syncMaintenanceTemplateLibrary = async () => {
    try {
      setTemplateSyncLoading(true);
      setTemplateSyncError("");
      setTemplateSyncSuccessMessage("");

      const response = await getMaintenanceTemplateLibrary();
      const syncedAt = new Date().toISOString();

      const library: StoredMaintenanceTemplateLibrary = {
        templates: response.templates.map((template) => ({
          code: template.code,
          name: template.name,
          templateType: template.templateType,
          versionId: template.versionId,
          versionNumber: template.versionNumber,
          tasks: template.tasks.map((task) => ({
            id: task.id,
            category: task.category,
            task: task.task,
            tool: task.tool || "",
            unit: task.unit,
            required: task.required ?? true,
            measurable: task.measurable ?? false,
            photoRequiredOnFault: task.photoRequiredOnFault ?? true,
            photoRequiredOnAttention: task.photoRequiredOnAttention ?? true,
          })),
        })),
        syncedAt,
      };

      saveMaintenanceTemplateLibrary(library);

      updateOfflineSyncMetadata({ maintenanceTemplateSyncedAt: syncedAt });
      setOfflineSyncMetadata((current) => ({
        ...current,
        maintenanceTemplateSyncedAt: syncedAt,
      }));

      setTemplateSyncSuccessMessage("Maintenance template library synced successfully.");
    } catch (error) {
      console.error(error);
      setTemplateSyncError("Failed to sync maintenance template library.");
      throw error;
    } finally {
      setTemplateSyncLoading(false);
    }
  };

  useEffect(() => {
    const shouldAutoSync =
      fleet.vessels.length === 0 &&
      fleet.reports.length === 0 &&
      fleet.correctiveDrafts.length === 0;
      fleet.cfrDrafts.length === 0;

    if (!shouldAutoSync) return;

    const run = async () => {
      try {
        await syncFleetRegistry();
      } catch (error) {
        console.error("Auto fleet sync failed.", error);
      }
    };

    run();
  }, []);

  const syncOfflineRegistry = async () => {
    setTemplateSyncError("");
    setTemplateSyncSuccessMessage("");
    setFleetSyncError("");
    setFleetSyncSuccessMessage("");

    let hasError = false;

    try {
      await syncMaintenanceTemplateLibrary();
    } catch (error) {
      console.error("Template sync failed:", error);
      hasError = true;
    }

    try {
      await syncFleetRegistry();
    } catch (error) {
      console.error("Fleet sync failed:", error);
      hasError = true;
    }

    if (hasError) {
      throw new Error("One or more offline sync steps failed.");
    }
  };

  const saveCfrDraft = (draft: CfrDraft) => {
    const payload = {
      ...draft,
      synced: false,
      reportCategory: "cfr" as const,
    };

    setFleet((current) => {
      const existing = current.cfrDrafts.find((item) => item.id === payload.id);

      return {
        ...current,
        cfrDrafts: existing
          ? current.cfrDrafts.map((item) => (item.id === payload.id ? payload : item))
          : [payload, ...current.cfrDrafts],
      };
    });
  };

  const deleteCfrDraft = (draftId: string) => {
    setFleet((current) => ({
      ...current,
      cfrDrafts: current.cfrDrafts.filter((item) => item.id !== draftId),
    }));
  };

  const getCfrDraftByMachine = (machineId: string) => {
    return fleet.cfrDrafts.find((item) => item.machineId === machineId) || null;
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

        <Route
          path="/machines"
          element={
            <MachinesPage
              vessels={fleet.vessels}
              onEditMachine={editMachine}
              onDeleteMachine={deleteMachine}
            />
          }
        />

        <Route path="/add" element={<Navigate to="/vessels" replace />} />
        <Route
          path="/sync"
          element={
            <SyncPage
              reports={fleet.reports}
              correctiveDrafts={fleet.correctiveDrafts}
              cfrDrafts={fleet.cfrDrafts}
              onSyncAll={syncAllPendingItems}
              onSyncReport={syncPreventiveReport}
              onSyncCorrectiveDraft={syncCorrectiveDraft}
              onSyncCfrDraft={syncCfrDraft}
              onDeleteReport={deletePreventiveReport}
              onDeleteCorrectiveDraft={deleteCorrectiveDraft}
              onDeleteCfrDraft={deleteCfrDraft}
              onSyncOfflineRegistry={syncOfflineRegistry}
              fleetSyncLoading={fleetSyncLoading}
              fleetSyncError={fleetSyncError}
              fleetSyncSuccessMessage={fleetSyncSuccessMessage}
              templateSyncLoading={templateSyncLoading}
              templateSyncError={templateSyncError}
              templateSyncSuccessMessage={templateSyncSuccessMessage}
              fleetRegistrySyncedAt={offlineSyncMetadata.fleetRegistrySyncedAt}
              maintenanceTemplateSyncedAt={offlineSyncMetadata.maintenanceTemplateSyncedAt}
            />
          }
        />

        <Route
          path="/reports"
          element={
            <ReportsPage
              vessels={fleet.vessels}
              reports={fleet.reports}
              correctiveDrafts={fleet.correctiveDrafts}
              cfrDrafts={fleet.cfrDrafts}
            />
          }
        />

        <Route
          path="/reports/:reportId"
          element={<ReportDetailPage reports={fleet.reports} photos={fleet.photos} />}
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
              onAddMachinePhoto={addMachinePhoto}
              onAddTaskPhoto={addTaskPhoto}
              onDeleteMachinePhoto={deleteMachinePhoto}
              onDeleteTaskPhoto={deleteTaskPhoto}
              getMachinePhotoCount={getMachinePhotoCount}
              getTaskPhotoCount={getTaskPhotoCount}
            />
          }
        />

        <Route
          path="/machines/:machineId"
          element={<MachineViewPage vessels={fleet.vessels} />}
        />

        <Route
          path="/vessels/:vesselId/machines/:machineId/corrective"
          element={
            <CorrectiveMaintenancePage
              vessels={fleet.vessels}
              onSaveDraft={saveCorrectiveDraft}
              onDeleteDraft={deleteCorrectiveDraft}
              getExistingDraft={getCorrectiveDraftByMachine}
            />
          }
        />

        <Route
          path="/vessels/:vesselId/machines/:machineId/cfr"
          element={
            <CfrReportPage
              vessels={fleet.vessels}
              onSaveDraft={saveCfrDraft}
              onDeleteDraft={deleteCfrDraft}
              getExistingDraft={getCfrDraftByMachine}
            />
          }
        />

        <Route
          path="/cfr-reports/:draftId"
          element={<CfrReportDetailPage cfrDrafts={fleet.cfrDrafts} />}
        />

        <Route
          path="/corrective-reports/:draftId"
          element={<CorrectiveReportDetailPage correctiveDrafts={fleet.correctiveDrafts} />}
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