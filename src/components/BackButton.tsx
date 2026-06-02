import { useNavigate } from "react-router-dom";

type Props = {
  to?: string;
};

export function BackButton({ to }: Props) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (to) {
          navigate(to, { replace: true });
          return;
        }

        navigate(-1);
      }}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm ring-1 ring-slate-200"
    >
      ← Back
    </button>
  );
}
