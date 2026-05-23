import { type ReactNode } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "default" | "wide";
};

export function Modal({ title, open, onClose, children, size = "default" }: Props) {
  if (!open) return null;

  const widthClass = size === "wide" ? "max-w-3xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className={`max-h-[calc(100vh-2rem)] w-full ${widthClass} overflow-y-auto rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
