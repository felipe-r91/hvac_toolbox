import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { InputField } from "./InputField";
import { getAvailableMachineModels, getAvailableStarterModels } from "../data/maintenancePlanLibrary";
import { type MachinePlan, type NewMachinePayload } from "../types/maintenance";

type EditingMachine = {
  vesselId: string;
  vesselName: string;
  plan: MachinePlan;
};

type Props = {
  open: boolean;
  machine: EditingMachine | null;
  onClose: () => void;
  onSave: (payload: {
    machineId: string;
  } & NewMachinePayload) => void;
};

export function EditMachineModal({ open, machine, onClose, onSave }: Props) {
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState("");
  const [model, setModel] = useState(getAvailableMachineModels()[0] || "");
  const [serialNumber, setSerialNumber] = useState("");
  const [type, setType] = useState("");
  const [starterType, setStarterType] = useState("");
  const [refrigerant, setRefrigerant] = useState("");
  const [oilType, setOilType] = useState("");
  const [controlSystem, setControlSystem] = useState("");
  const [softwareVersion, setSoftwareVersion] = useState("");
  const [compressorType, setCompressorType] = useState("");
  const [mfg, setMfg] = useState("");

  useEffect(() => {
    if (!machine) return;

    setLocation(machine.plan.machine.location);
    setTag(machine.plan.machine.tag);
    setModel(machine.plan.machine.model);
    setSerialNumber(machine.plan.machine.serialNumber);
    setType(machine.plan.machine.type);
    setStarterType(machine.plan.machine.starterType);
    setRefrigerant(machine.plan.machine.refrigerant || "");
    setOilType(machine.plan.machine.oilType || "");
    setControlSystem(machine.plan.machine.controlSystem || "");
    setSoftwareVersion(machine.plan.machine.softwareVersion || "");
    setCompressorType(machine.plan.machine.compressorType || "");
    setMfg(machine.plan.machine.mfg || "");
  }, [machine]);

  return (
    <Modal title="Edit machine" open={open} onClose={onClose} size="wide">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InputField label="Location" value={location} onChange={setLocation} />
          <InputField label="Tag" value={tag} onChange={setTag} />

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

          <InputField label="Serial number" value={serialNumber} onChange={setSerialNumber} />
          <InputField label="Type" value={type} onChange={setType} />
          <InputField label="Refrigerant" value={refrigerant} onChange={setRefrigerant} />
          <InputField label="Oil Type" value={oilType} onChange={setOilType} />
          <InputField label="Control System" value={controlSystem} onChange={setControlSystem} />
          <InputField label="Software Version" value={softwareVersion} onChange={setSoftwareVersion} />
          <InputField label="Compressor Type" value={compressorType} onChange={setCompressorType} />
          <InputField label="MFG" value={mfg} onChange={setMfg} />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!machine || !tag.trim()) return;

            onSave({
              vesselId: machine.vesselId,
              machineId: machine.plan.machine.id,
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
            });

            onClose();
          }}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          Save changes
        </button>
      </div>
    </Modal>
  );
}
