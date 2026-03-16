import { useRef } from "react";
import { IoImageOutline, IoTrashOutline } from "react-icons/io5";

type Props = {
  label: string;
  required?: boolean;
  count: number;
  previewUrls?: string[];
  onDeletePhoto?: (previewUrl: string) => void;
  onPick: (file: File) => void;
};

export function MachinePhotoSection({
  label,
  required,
  count,
  previewUrls = [],
  onDeletePhoto,
  onPick,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Machine identification photo: only one picture is allowed
  const previewUrl = previewUrls[0] || null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="ml-2 text-md font-semibold text-slate-900">
          {label} {required ? "*" : ""}
        </h2>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {count} picture{count === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div
          onClick={() => inputRef.current?.click()}
          className="flex h-72 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <IoImageOutline size={100} className="text-slate-300" />
              <div className="text-sm text-slate-400">Tap to take photo</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          {previewUrl ? "Replace photo" : "Take photo"}
        </button>

        {previewUrl && onDeletePhoto ? (
          <button
            type="button"
            onClick={() => onDeletePhoto(previewUrl)}
            className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
            aria-label="Delete photo"
          >
            <IoTrashOutline size={20} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onPick(file);
          e.currentTarget.value = "";
        }}
      />
    </section>
  );
}