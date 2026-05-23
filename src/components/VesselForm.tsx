import { useState } from "react";
import { type NewVesselPayload } from "../types/maintenance";

type Props = {
  onSubmit: (payload: NewVesselPayload) => void;
};

export function VesselForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [ownerCustomer, setOwnerCustomer] = useState("");
  const [vesselContact, setVesselContact] = useState("");

  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vessel name"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
        />
        <input
          value={imoNumber}
          onChange={(e) => setImoNumber(e.target.value)}
          placeholder="IMO number"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
        />
        <input
          value={vesselType}
          onChange={(e) => setVesselType(e.target.value)}
          placeholder="Vessel Type"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
        />
        <input
          value={ownerCustomer}
          onChange={(e) => setOwnerCustomer(e.target.value)}
          placeholder="Owner/Customer"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
        />
        <input
          value={vesselContact}
          onChange={(e) => setVesselContact(e.target.value)}
          placeholder="Vessel Contact"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (!name.trim()) return;
          onSubmit({
            name: name.trim(),
            imoNumber: imoNumber.trim(),
            vesselType: vesselType.trim(),
            ownerCustomer: ownerCustomer.trim(),
            vesselContact: vesselContact.trim(),
          });
          setName("");
          setImoNumber("");
          setVesselType("");
          setOwnerCustomer("");
          setVesselContact("");
        }}
        className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white w-full"
      >
        Add vessel
      </button>
    </section>
  );
}
