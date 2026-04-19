import type { FleetData, Vessel } from "../types/maintenance";

export function mergeFleetRegistry(current: FleetData, remoteVessels: Vessel[]): FleetData {
  return {
    ...current,
    vessels: remoteVessels,
    reports: current.reports,
    correctiveDrafts: current.correctiveDrafts,
    photos: current.photos,
  };
}