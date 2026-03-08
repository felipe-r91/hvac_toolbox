import { useState } from "react";

type Props = {
  onSubmit: (payload: { name: string; imoNumber: string; description: string }) => void;
};

export function VesselForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [description, setDescription] = useState("");

  return (
    <section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
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
            description: description.trim(),
          });
          setName("");
          setImoNumber("");
          setDescription("");
        }}
        className="mt-3 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white w-full"
      >
        Add vessel
      </button>
    </section>
  );
}