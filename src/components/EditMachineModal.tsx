import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { InputField } from "./InputField";
import { availableMachineModels, availableStartersModels } from "../data/maintenancePlanLibrary";
import { type MachinePlan } from "../types/maintenance";

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
    vesselId: string;
    machineId: string;
    location: string;
    tag: string;
    model: string;
    serialNumber: string;
    type: string;
    starterType: string;
  }) => void;
};

export function EditMachineModal({ open, machine, onClose, onSave }: Props) {
  const [location, setLocation] = useState("");
  const [tag, setTag] = useState("");
  const [model, setModel] = useState(availableMachineModels[0] || "");
  const [serialNumber, setSerialNumber] = useState("");
  const [type, setType] = useState("");
  const [starterType, setStarterType] = useState("");

  useEffect(() => {
    if (!machine) return;

    setLocation(machine.plan.machine.location);
    setTag(machine.plan.machine.tag);
    setModel(machine.plan.machine.model);
    setSerialNumber(machine.plan.machine.serialNumber);
    setType(machine.plan.machine.type);
    setStarterType(machine.plan.machine.starterType);
  }, [machine]);

  return (
    <Modal title="Edit machine" open={open} onClose={onClose}>
      <div className="space-y-3">
        <InputField label="Location" value={location} onChange={setLocation} />
        <InputField label="Tag" value={tag} onChange={setTag} />

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
            {availableStartersModels.map((starterModels) => (
              <option key={starterModels} value={starterModels}>
                {starterModels}
              </option>
            ))}
          </select>
        </label>

        <InputField label="Serial number" value={serialNumber} onChange={setSerialNumber} />
        <InputField label="Type" value={type} onChange={setType} />

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