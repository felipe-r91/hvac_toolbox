import { useRef } from "react";
import { IoImageOutline } from "react-icons/io5";

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
  const timerRef = useRef<number | null>(null);

  const startLongPress = (previewUrl: string) => {
    if (!onDeletePhoto) return;

    timerRef.current = window.setTimeout(() => {
      const confirmed = window.confirm("Delete this photo?");
      if (confirmed) onDeletePhoto(previewUrl);
    }, 700);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
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
                className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200"
                onMouseDown={() => startLongPress(url)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(url)}
                onTouchEnd={cancelLongPress}
                onTouchCancel={cancelLongPress}
              >
                <img
                  src={url}
                  alt={label}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
          >
            <div className="text-slate-300">
              <IoImageOutline size={100}/>
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
  );
}