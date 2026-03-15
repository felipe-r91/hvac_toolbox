import { useRef } from "react";
import { IoImageOutline } from "react-icons/io5";

type Props = {
  label: string;
  required?: boolean;
  count: number;
  previewUrl?: string | null;
  onPick: (file: File) => void;
};

export function PhotoCaptureField({ label, required = false, count, previewUrl, onPick }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  
    return (
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-md ml-2 font-semibold text-slate-900">
            {label} {required ? "*" : ""}
          </h2>
  
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {count} pictures
          </span>
        </div>
  
        {/* preview / placeholder */}
        <div
          onClick={() => inputRef.current?.click()}
          className="flex h-54 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
              <div>
                  <IoImageOutline size={100} className="text-slate-300"/>
                  <div className="text-slate-400 text-sm">Tap to take photo</div>      
              </div>
            
          )}
        </div>
  
        {/* hidden real input */}
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