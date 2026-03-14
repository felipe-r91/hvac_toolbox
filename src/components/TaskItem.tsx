import { useState } from "react";
import { type MaintenanceTask, type TaskStatus } from "../types/maintenance";

function statusClasses(status: TaskStatus) {
  switch (status) {
    case "ok":
      return "bg-green-100 text-green-800 border-green-200";
    case "attention":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "fault":
      return "bg-red-100 text-red-800 border-red-200";
    case "not-applicable":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "skipped":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

type Props = {
  task: MaintenanceTask;
  onChange: (task: MaintenanceTask) => void;
};

export function TaskItem({ task, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.checked}
          onChange={(e) =>
            onChange({
              ...task,
              checked: e.target.checked,
              completedAt: e.target.checked ? new Date().toISOString() : undefined,
              status: e.target.checked && task.status === "pending" ? "ok" : task.status,
            })
          }
          className="mt-1 h-5 w-5 rounded"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{task.task}</h3>
              <p className="mt-1 text-xs text-slate-500">Tool: {task.tool || "—"}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(task.status)}`}>
                {task.status}
              </span>
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {expanded ? "Hide" : "Open"}
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => onChange({ ...task, status: e.target.value as TaskStatus })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="ok">OK</option>
                  <option value="attention">Attention</option>
                  <option value="fault">Fault</option>
                  <option value="not-applicable">Not applicable</option>
                  <option value="skipped">Skipped</option>
                </select>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Measured value</span>
                  <input
                    value={task.measuredValue}
                    onChange={(e) => onChange({ ...task, measuredValue: e.target.value })}
                    placeholder={task.unit ? `Enter value in ${task.unit}` : "Enter value"}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">Unit</span>
                  <input
                    value={task.unit || ""}
                    onChange={(e) => onChange({ ...task, unit: e.target.value })}
                    placeholder="bar, °C, mm..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Notes</span>
                <textarea
                  value={task.notes}
                  onChange={(e) => onChange({ ...task, notes: e.target.value })}
                  rows={3}
                  placeholder="Write inspection notes, findings, alarms, leakage values, observations..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                />
              </label>

              {task.completedAt ? (
                <p className="text-xs text-slate-500">
                  Completed at: {new Date(task.completedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}