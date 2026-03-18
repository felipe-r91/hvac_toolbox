import { useRef } from "react";
import { IoCameraOutline, IoTrashOutline } from "react-icons/io5";
import { type CorrectivePhoto } from "../types/maintenance";

type Props = {
  photos: CorrectivePhoto[];
  onAddPhoto: (file: File) => void;
  onUpdateCaption: (photoId: string, caption: string) => void;
  onDeletePhoto: (photoId: string) => void;
};

export function CorrectivePhotosSection({
  photos,
  onAddPhoto,
  onUpdateCaption,
  onDeletePhoto,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {photos.length} photo{photos.length <1 ? "" : "s"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
      >
        <IoCameraOutline size={18} />
        Add photo
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onAddPhoto(file);
          e.currentTarget.value = "";
        }}
      />

      {photos.length > 0 ? (
        <div className="space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
            >
              {photo.previewUrl ? (
                <img
                  src={photo.previewUrl}
                  alt={photo.caption || "Corrective maintenance photo"}
                  className="h-52 w-full rounded-2xl object-cover"
                />
              ) : null}

              <div className="mt-3 flex gap-3">
                <input
                  value={photo.caption}
                  onChange={(e) => onUpdateCaption(photo.id, e.target.value)}
                  placeholder="Photo label, e.g. Oil leak at shaft seal"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
                />

                <button
                  type="button"
                  onClick={() => onDeletePhoto(photo.id)}
                  className="flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-red-700 ring-1 ring-red-200"
                  aria-label="Delete photo"
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No photos added yet.
        </div>
      )}
    </section>
  );
}