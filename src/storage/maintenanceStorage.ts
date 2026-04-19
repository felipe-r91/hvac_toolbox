import { type FleetData } from "../types/maintenance";
import { emptyFleet } from "../data/emptyFleet";

const STORAGE_KEY = "hvac-fleet-data-v3";

export function loadFleet(): FleetData {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return emptyFleet;

  try {
    const parsed = JSON.parse(raw) as FleetData;

    return {
      vessels: Array.isArray(parsed.vessels) ? parsed.vessels : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      photos: Array.isArray(parsed.photos) ? parsed.photos : [],
      correctiveDrafts: Array.isArray(parsed.correctiveDrafts)
        ? parsed.correctiveDrafts
        : [],
    };
  } catch {
    return emptyFleet;
  }
}

export function saveFleet(fleet: FleetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
}

export function resetFleet() {
  localStorage.removeItem(STORAGE_KEY);
}