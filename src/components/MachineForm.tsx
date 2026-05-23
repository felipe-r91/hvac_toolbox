import { useEffect, useMemo, useState } from "react";
import { getAvailableMachineModels, getAvailableStarterModels, createTasksFromModel } from "../data/maintenancePlanLibrary";
import { type MaintenanceTask, type NewMachinePayload, type Vessel } from "../types/maintenance";

type Props = {
  vessels: Vessel[];
  onSubmit: (payload: NewMachinePayload & { tasks: MaintenanceTask[] }) => void;
};

export function MachineForm({ vessels, onSubmit }: Props) {
  const [vesselId, setVesselId] = useState(vessels[0]?.id || "");
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState("");
  const [model, setModel] = useState<string>(getAvailableMachineModels()[0] || "");
  const [serialNumber, setSerialNumber] = useState("");
  const [starterType, setStarterType] = useState<string>(getAvailableStarterModels()[0] || "");
  const [type, setType] = useState("Chiller");
  const [refrigerant, setRefrigerant] = useState("");
  const [oilType, setOilType] = useState("");
  const [controlSystem, setControlSystem] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("");
  const [compressorType, setCompressorType] = useState("");
  const [mfg, setMfg] = useState("");

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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block md:col-span-2">
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
            {getAvailableMachineModels().map((machineModel) => (
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
            {getAvailableStarterModels().map((starterModel) => (
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
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Refrigerant</span>
          <input value={refrigerant} onChange={(e) => setRefrigerant(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Oil Type</span>
          <input value={oilType} onChange={(e) => setOilType(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Control System</span>
          <input value={controlSystem} onChange={(e) => setControlSystem(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Software Version</span>
          <input value={softwareVersion} onChange={(e) => setSoftwareVersion(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Compressor Type</span>
          <input value={compressorType} onChange={(e) => setCompressorType(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">MFG</span>
          <input value={mfg} onChange={(e) => setMfg(e.target.value)} className="w-full h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none" />
        </label>
      </div>

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
            refrigerant: refrigerant.trim(),
            oilType: oilType.trim(),
            controlSystem: controlSystem.trim(),
            softwareVersion: softwareVersion.trim(),
            compressorType: compressorType.trim(),
            mfg: mfg.trim(),
            tasks: createTasksFromModel(model, starterType),
          });
          setLocation("");
          setTag("");
          setSerialNumber("");
          setType("Chiller");
          setRefrigerant("");
          setOilType("");
          setControlSystem("");
          setSoftwareVersion("");
          setCompressorType("");
          setMfg("");
          setModel(getAvailableMachineModels()[0] || "");
          setStarterType(getAvailableStarterModels()[0] || "");
        }}
        className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Save machine
      </button>
    </div>
  );
}
