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
  type CorrectiveDraft,
} from "./types/maintenance";
import { VesselsPage } from "./pages/VesselsPage";
import { ShipMachinesPage } from "./pages/ShipMachinesPage";
import { MachineDetailPage } from "./pages/MachineDetailPage";
import { MachinesPage } from "./pages/MachinesPage";
import { SyncPage } from "./pages/SyncPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportDetailPage } from "./pages/ReportDetailPage";
import { createId } from "./utils/createId";
import { createTasksFromModel } from "./data/maintenancePlanLibrary";
import { CorrectiveMaintenancePage } from "./pages/CorrectiveMaintenancePage";
import { CorrectiveReportDetailPage } from "./pages/CorrectiveReportDetailPage";
import { MachineViewPage } from "./pages/MachineViewPage";
import { compressImageFile } from "./utils/imageCompression";
import { savePhotoBlob, getPhotoBlob, deletePhotoBlob } from "./storage/photoDb";

const API_BASE_URL = "http://localhost:8080";

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
      .map((photo) => photo.previewUrl)
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
      .map((photo) => photo.previewUrl)
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
  onCreateReport: (vesselId: string, machineId: string) => string | null;
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
      photos: current.photos.filter((photo) => {
        const vessel = current.vessels.find((item) => item.id === vesselId);
        const machineIds = vessel?.machines.map((plan) => plan.machine.id) || [];
        return !machineIds.includes(photo.machineId);
      }),
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
                starterType: payload.starterType,
                operatingStatus: "online",
                downtimeReason: "",
                failureComponent: undefined,
                failureMode: undefined,
                failureNotes: "",
              },
              tasks: createTasksFromModel(payload.model, payload.starterType),
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

  const createReport = (vesselId: string, machineId: string) => {
  const vessel = fleet.vessels.find((item) => item.id === vesselId);
  const plan = vessel?.machines.find((item) => item.machine.id === machineId);

  if (!vessel || !plan) return null;

  const reportId = createId();

  const faultCount = plan.tasks.filter((task) => task.status === "fault").length;
  const skippedCount = plan.tasks.filter((task) => task.status === "skipped").length;

  const machinePhotoIds = fleet.photos
    .filter((photo) => photo.machineId === plan.machine.id && photo.kind === "machine")
    .map((photo) => photo.id);

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
    completedAt: new Date().toISOString(),
    overallStatus: plan.machine.operatingStatus === "down" ? "down" : "online",
    downtimeReason: plan.machine.downtimeReason || "",
    failureComponent: plan.machine.failureComponent,
    failureMode: plan.machine.failureMode,
    failureNotes: plan.machine.failureNotes || "",
    faultCount,
    skippedCount,
    machinePhotoIds,
    tasks: plan.tasks.map((task) => ({ ...task })),
    synced: false,
  };

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

    // KEEP preventive photos, but now bind them to this report
    photos: current.photos.map((photo) => {
      if (photo.machineId !== machineId) return photo;

      const isMachinePhoto = photo.kind === "machine";
      const isTaskPhoto = photo.kind === "task";

      if (!isMachinePhoto && !isTaskPhoto) return photo;

      return {
        ...photo,
        reportId,
      };
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
              failureNotes: "",
            },
            tasks: resetTasks,
          };
        }),
      };
    }),
  }));

  return reportId;
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
                  starterType: payload.starterType,
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
          machines: vessel.machines.filter((plan) => plan.machine.id !== payload.machineId),
        };
      }),
      reports: current.reports.filter((report) => report.machineId !== payload.machineId),
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

  const deletePreventiveReport = (reportId: string) => {
    setFleet((current) => ({
      ...current,
      reports: current.reports.filter((report) => report.id !== reportId),
    }));
  };

  const syncAllPendingItems = async () => {
  try {
    for (const report of fleet.reports.filter((item) => !item.synced)) {
      await postPreventiveReport(report);
      await uploadPreventiveMachinePhotos(report);
      await uploadPreventiveTaskPhotos(report);
      await cleanupPreventiveReportPhotos(report);
      markReportSynced(report.id);
    }

    for (const draft of fleet.correctiveDrafts.filter((item) => !item.synced)) {
      await postCorrectiveDraft(draft);

      for (const photo of draft.photos) {
        await uploadPhotoRecord({
          ownerType: "CORRECTIVE_DRAFT",
          ownerId: draft.id,
          machineId: draft.machineId,
          caption: photo.caption,
          photoId: photo.id,
        });
      }

      await cleanupCorrectiveDraftPhotos(draft);
      markCorrectiveDraftSynced(draft.id);
    }

    alert("All pending items synced successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to sync all pending items.");
  }
};

  const syncPreventiveReport = async (reportId: string) => {
  const report = fleet.reports.find((item) => item.id === reportId);

  if (!report) {
    alert("Preventive report not found.");
    return;
  }

  try {
    await postPreventiveReport(report);
    await uploadPreventiveMachinePhotos(report);
    await uploadPreventiveTaskPhotos(report);
    await cleanupPreventiveReportPhotos(report);

    markReportSynced(reportId);
    alert("Preventive report synced successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to sync preventive report.");
  }
};

  const syncCorrectiveDraft = async (draftId: string) => {
  const draft = fleet.correctiveDrafts.find((item) => item.id === draftId);

  if (!draft) {
    alert("Corrective draft not found.");
    return;
  }

  try {
    await postCorrectiveDraft(draft);

    for (const photo of draft.photos) {
      await uploadPhotoRecord({
        ownerType: "CORRECTIVE_DRAFT",
        ownerId: draft.id,
        machineId: draft.machineId,
        caption: photo.caption,
        photoId: photo.id,
      });
    }

    await cleanupCorrectiveDraftPhotos(draft);
    markCorrectiveDraftSynced(draftId);

    alert("Corrective draft synced successfully.");
  } catch (error) {
    console.error(error);
    alert("Failed to sync corrective draft.");
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

  const uploadPhotoRecord = async ({
    ownerType,
    ownerId,
    machineId,
    taskId,
    caption,
    photoId,
  }: {
    ownerType: "CORRECTIVE_DRAFT" | "PREVENTIVE_MACHINE" | "PREVENTIVE_TASK";
    ownerId: string;
    machineId: string;
    taskId?: string;
    caption?: string;
    photoId: string;
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

    const response = await fetch(`${API_BASE_URL}/api/photos/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Photo upload failed: ${text}`);
    }

    return response.json();
  };

  const uploadPreventiveMachinePhotos = async (report: MaintenanceReport) => {
  const machinePhotos = fleet.photos.filter(
    (photo) =>
      photo.reportId === report.id &&
      photo.machineId === report.machineId &&
      photo.kind === "machine" &&
      report.machinePhotoIds?.includes(photo.id)
  );

  for (const photo of machinePhotos) {
    await uploadPhotoRecord({
      ownerType: "PREVENTIVE_MACHINE",
      ownerId: report.id,
      machineId: report.machineId,
      caption: "Machine identification photo",
      photoId: photo.id,
    });
  }
};

  const uploadPreventiveTaskPhotos = async (report: MaintenanceReport) => {
  for (const task of report.tasks) {
    const taskPhotoIds = task.photoIds || [];
    if (taskPhotoIds.length === 0) continue;

    const taskPhotos = fleet.photos.filter(
      (photo) =>
        photo.reportId === report.id &&
        photo.machineId === report.machineId &&
        photo.kind === "task" &&
        photo.taskId === task.id &&
        taskPhotoIds.includes(photo.id)
    );

    for (const photo of taskPhotos) {
      await uploadPhotoRecord({
        ownerType: "PREVENTIVE_TASK",
        ownerId: report.id,
        machineId: report.machineId,
        taskId: task.id,
        caption: task.task,
        photoId: photo.id,
      });
    }
  }
};

const cleanupPreventiveReportPhotos = async (report: MaintenanceReport) => {
  const relatedPhotos = fleet.photos.filter((photo) => photo.reportId === report.id);

  for (const photo of relatedPhotos) {
    await deletePhotoBlob(photo.id);
  }

  setFleet((current) => ({
    ...current,
    photos: current.photos.filter((photo) => photo.reportId !== report.id),
  }));
};

const cleanupCorrectiveDraftPhotos = async (draft: CorrectiveDraft) => {
  for (const photo of draft.photos) {
    await deletePhotoBlob(photo.id);
  }

  setFleet((current) => ({
    ...current,
    correctiveDrafts: current.correctiveDrafts.map((item) =>
      item.id === draft.id
        ? {
            ...item,
            photos: [],
          }
        : item
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
              onSyncAll={syncAllPendingItems}
              onSyncReport={syncPreventiveReport}
              onSyncCorrectiveDraft={syncCorrectiveDraft}
              onDeleteReport={deletePreventiveReport}
              onDeleteCorrectiveDraft={deleteCorrectiveDraft}
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
            />
          }
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