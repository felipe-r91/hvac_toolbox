import { useState } from "react";
import { type MaintenanceTask, type TaskCategory } from "../types/maintenance";
import { TaskItem } from "./TaskItem";

type Props = {
  category: TaskCategory;
  tasks: MaintenanceTask[];
  onUpdateTask: (task: MaintenanceTask) => void;
  onAddTaskPhoto: (taskId: string, file: File) => void;
  getTaskPhotoCount: (taskId: string) => number;
  getTaskPhotoUrls: (taskId: string) => string[];
  onDeleteTaskPhoto: (taskId: string, previewUrl: string) => void;
};

export function CategorySection({
  category,
  tasks,
  onUpdateTask,
  onAddTaskPhoto,
  getTaskPhotoCount,
  getTaskPhotoUrls,
  onDeleteTaskPhoto,

}: Props) {
  const [open, setOpen] = useState(category === "Daily");
  const completed = tasks.filter((task) => task.checked).length;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{category}</h2>
          <p className="text-sm text-slate-500">
            {completed}/{tasks.length} completed
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onChange={onUpdateTask}
              onAddTaskPhoto={onAddTaskPhoto}
              getTaskPhotoCount={getTaskPhotoCount}
              getTaskPhotoUrls={getTaskPhotoUrls}
              onDeleteTaskPhoto={onDeleteTaskPhoto}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}