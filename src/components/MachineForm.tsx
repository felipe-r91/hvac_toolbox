import { useEffect, useMemo, useState } from "react";
import { availableMachineModels, availableStartersModels, createTasksFromModel } from "../data/maintenancePlanLibrary";
import { type MaintenanceTask, type NewMachinePayload, type Vessel } from "../types/maintenance";

type Props = {
  vessels: Vessel[];
  onSubmit: (payload: NewMachinePayload & { tasks: MaintenanceTask[] }) => void;
};

export function MachineForm({ vessels, onSubmit }: Props) {
  const [vesselId, setVesselId] = useState(vessels[0]?.id || "");
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState("");
  const [model, setModel] = useState<string>(availableMachineModels[0] || "");
  const [serialNumber, setSerialNumber] = useState("");
  const [starterType, setStarterType] = useState<string>(availableStartersModels[0] || "");
  const [type, setType] = useState("Chiller");

  const hasVessels = useMemo(() => vessels.length > 0, [vessels.length]);

  useEffect(() => {
    if (!vesselId && vessels.length > 0) {
      setVesselId(vessels[0].id);
    }
  }, [vessels, vesselId]);

  if (!hasVessels) {
    return <p className="text-sm text-slate-500">Add a ship before creating a machine.</p>;
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Ship</span>
        <select
          value={vesselId}
          onChange={(e) => setVesselId(e.target.value)}
          className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
        >
          {vessels.map((vessel) => (
            <option key={vessel.id} value={vessel.id}>
              {vessel.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Model</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
        >
          {availableMachineModels.map((machineModel) => (
            <option key={machineModel} value={machineModel}>
              {machineModel}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Starter Type</span>
        <select
          value={starterType}
          onChange={(e) => setStarterType(e.target.value)}
          className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none"
        >
          {availableStartersModels.map((starterModel) => (
            <option key={starterModel} value={starterModel}>
              {starterModel}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Location</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Tag</span>
        <input value={tag} onChange={(e) => setTag(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Serial number</span>
        <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Type</span>
        <input value={type} onChange={(e) => setType(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
      </label>

      <button
        type="button"
        onClick={() => {
          if (!vesselId || !tag.trim() || !model) return;
          onSubmit({
            vesselId,
            location: location.trim(),
            tag: tag.trim(),
            model,
            serialNumber: serialNumber.trim(),
            type: type.trim(),
            starterType: starterType.trim(),
            tasks: createTasksFromModel(model, starterType),
          });
          setLocation("");
          setTag("");
          setSerialNumber("");
          setType("Chiller");
          setModel(availableMachineModels[0] || "");
          setStarterType(availableStartersModels[0] || "");
        }}
        className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Save machine
      </button>
    </div>
  );
}