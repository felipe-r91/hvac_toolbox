import { useRef } from "react";
import {
  IoCameraOutline,
  IoImageOutline,
  IoImagesOutline,
  IoTrashOutline,
} from "react-icons/io5";

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
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Machine identification photo: only one picture is allowed
  const previewUrl = previewUrls[0] || null;

  const handlePick = (file?: File) => {
    if (!file) return;
    onPick(file);
  };

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
          className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
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
              <div className="text-sm text-slate-400">No photo selected</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          <IoCameraOutline size={18} />
          {previewUrl ? "Retake photo" : "Take photo"}
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
        >
          <IoImagesOutline size={18} />
          {previewUrl ? "Replace from gallery" : "Choose from gallery"}
        </button>
      </div>

      {previewUrl && onDeletePhoto ? (
        <div className="mt-3 flex">
          <button
            type="button"
            onClick={() => onDeletePhoto(previewUrl)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
            aria-label="Delete photo"
          >
            <IoTrashOutline size={20} />
            Delete photo
          </button>
        </div>
      ) : null}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
    </section>
  );
}
