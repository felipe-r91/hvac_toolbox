import { seedFleet } from "../data/seedData";
import { type FleetData } from "../types/maintenance";

const STORAGE_KEY = "hvac-fleet-data-v2";

export function loadFleet(): FleetData {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return seedFleet;

  try {
    const parsed = JSON.parse(raw) as FleetData;
    if (!parsed.vessels || !Array.isArray(parsed.vessels) || parsed.vessels.length === 0) {
      return seedFleet;
    }
    return parsed;
  } catch {
    return seedFleet;
  }
}

export function saveFleet(fleet: FleetData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
}

export function resetFleet() {
  localStorage.removeItem(STORAGE_KEY);
}