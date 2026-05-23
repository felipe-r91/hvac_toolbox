import { useRef } from "react";
import { IoCameraOutline, IoImagesOutline, IoTrashOutline } from "react-icons/io5";
import { type ReportPhoto } from "../types/maintenance";

type Props = {
  photos: ReportPhoto[];
  onAddPhoto: (file: File) => void;
  onUpdateCaption: (photoId: string, caption: string) => void;
  onDeletePhoto: (photoId: string) => void;
};

export function ReportPhotosSection({
  photos,
  onAddPhoto,
  onUpdateCaption,
  onDeletePhoto,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = (file?: File) => {
    if (!file) return;
    onAddPhoto(file);
  };

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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          <IoCameraOutline size={18} />
          Take photo
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
        >
          <IoImagesOutline size={18} />
          Choose from gallery
        </button>
      </div>

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
                  alt={photo.caption || "Report photo"}
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
