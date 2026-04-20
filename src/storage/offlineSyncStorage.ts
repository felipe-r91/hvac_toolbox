export type OfflineSyncMetadata = {
  fleetRegistrySyncedAt?: string;
  maintenanceTemplateSyncedAt?: string;
};

const STORAGE_KEY = "hvac-offline-sync-metadata-v1";

export function loadOfflineSyncMetadata(): OfflineSyncMetadata {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as OfflineSyncMetadata;
  } catch {
    return {};
  }
}

export function saveOfflineSyncMetadata(metadata: OfflineSyncMetadata) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
}

export function updateOfflineSyncMetadata(patch: Partial<OfflineSyncMetadata>) {
  const current = loadOfflineSyncMetadata();

  saveOfflineSyncMetadata({
    ...current,
    ...patch,
  });
}