import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { InputField } from "./InputField";
import { type NewVesselPayload, type Vessel } from "../types/maintenance";

type Props = {
  open: boolean;
  vessel: Vessel | null;
  onClose: () => void;
  onSave: (payload: {
    id: string;
  } & NewVesselPayload) => void;
};

export function EditVesselModal({ open, vessel, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [ownerCustomer, setOwnerCustomer] = useState("");
  const [vesselContact, setVesselContact] = useState("");

  useEffect(() => {
    if (!vessel) return;

    setName(vessel.name);
    setImoNumber(vessel.imoNumber);
    setVesselType(vessel.vesselType || "");
    setOwnerCustomer(vessel.ownerCustomer || "");
    setVesselContact(vessel.vesselContact || "");
  }, [vessel]);

  return (
    <Modal title="Edit ship" open={open} onClose={onClose}>
      <div className="space-y-3">
        <InputField
          label="Vessel name"
          value={name}
          onChange={setName}
        />

        <InputField
          label="IMO number"
          value={imoNumber}
          onChange={setImoNumber}
        />

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Vessel Type
          </span>

          <textarea
            value={vesselType}
            onChange={(e) => setVesselType(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-base outline-none"
          />
        </label>

        <InputField
          label="Owner/Customer"
          value={ownerCustomer}
          onChange={setOwnerCustomer}
        />

        <InputField
          label="Vessel Contact"
          value={vesselContact}
          onChange={setVesselContact}
        />

        <button
          type="button"
          onClick={() => {
            if (!vessel || !name.trim()) return;

            onSave({
              id: vessel.id,
              name: name.trim(),
              imoNumber: imoNumber.trim(),
              vesselType: vesselType.trim(),
              ownerCustomer: ownerCustomer.trim(),
              vesselContact: vesselContact.trim(),
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
