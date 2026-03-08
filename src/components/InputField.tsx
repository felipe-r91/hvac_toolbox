type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function InputField({ label, value, onChange }: Props) {
  return (
    <label className="block">
      <span className="mb-1 ml-2 block text-xs font-medium text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-md outline-none"
      />
    </label>
  );
}