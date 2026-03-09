type Props = {
  value: "online" | "down";
  downtimeReason: string;
  onStatusChange: (value: "online" | "down") => void;
  onReasonChange: (value: string) => void;
};

export function MachineStatusField({
  value,
  downtimeReason,
  onStatusChange,
  onReasonChange,
}: Props) {
  const isDown = value === "down";

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Machine status</h2>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDown}
          onClick={() => onStatusChange(isDown ? "online" : "down")}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
            isDown ? "bg-red-500" : "bg-green-600"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
              isDown ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 text-sm font-medium">
        <span className={value === "online" ? "text-green-700" : "text-slate-500"}>
          Online
        </span>
        <span className={value === "down" ? "text-red-700" : "text-slate-500"}>
          Down
        </span>
      </div>

      {isDown ? (
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Reason why machine is down
          </span>
          <textarea
            value={downtimeReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={4}
            placeholder="Describe the fault, alarm, trip condition"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none"
          />
        </label>
      ) : null}
    </section>
  );
}