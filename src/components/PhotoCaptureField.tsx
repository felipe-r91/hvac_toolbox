import { useRef, useState } from "react";
import { IoClose, IoImageOutline, IoTrashOutline } from "react-icons/io5";

type Props = {
  label: string;
  required?: boolean;
  count: number;
  previewUrls?: string[];
  onDeletePhoto?: (previewUrl: string) => void;
  onPick: (file: File) => void;
};

export function PhotoCaptureField({
  label,
  required = false,
  count,
  previewUrls = [],
  onDeletePhoto,
  onPick,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  return (
    <>
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            {label} {required ? "*" : ""}
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {count} photo{count === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mb-4">
          {previewUrls.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {previewUrls.map((url) => (
                <div
                  key={url}
                  className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200 select-none touch-manipulation"
                  style={{
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPreview(url)}
                    className="h-full w-full"
                  >
                    <img
                      src={url}
                      alt={label}
                      draggable={false}
                      className="h-full w-full pointer-events-none select-none object-cover"
                      style={{
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "none",
                        userSelect: "none",
                      }}
                    />
                  </button>

                  {onDeletePhoto ? (
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm("Delete this photo?");
                        if (confirmed) onDeletePhoto(url);
                      }}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white shadow-sm"
                      aria-label="Delete photo"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
            >
              <div className="flex flex-col items-center">
                <div className="text-slate-300">
                  <IoImageOutline size={100} />
                </div>
                <div className="mt-2 text-sm text-slate-400">Tap to take photo</div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          {previewUrls.length > 0 ? "Add another photo" : "Take photo"}
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
            onPick(file);
            e.currentTarget.value = "";
          }}
        />
      </section>

      {selectedPreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPreview(null)}
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white"
              aria-label="Close preview"
            >
              <IoClose size={22} />
            </button>

            <img
              src={selectedPreview}
              alt={label}
              draggable={false}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              style={{
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}