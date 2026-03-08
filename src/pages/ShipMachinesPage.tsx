import { Link, useParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { type Vessel } from "../types/maintenance";

type Props = {
  vessels: Vessel[];
};

export function ShipMachinesPage({ vessels }: Props) {
  const { vesselId } = useParams();
  const vessel = vessels.find((item) => item.id === vesselId);

  if (!vessel) {
    return <div className="p-6">Vessel not found.</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <BackButton />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">{vessel.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Machine list for this vessel.</p>
        </section>

        <section className="grid gap-3">
          {vessel.machines.map((plan) => {
            const completed = plan.tasks.filter((task) => task.checked).length;
            const total = plan.tasks.length;

            return (
              <Link
                key={plan.machine.id}
                to={`/vessels/${vessel.id}/machines/${plan.machine.id}`}
                className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{plan.machine.tag}</h2>
                    <p className="text-sm text-slate-500">{plan.machine.location}</p>
                    <p className="text-sm text-slate-500">{plan.machine.model} · {plan.machine.type}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {completed}/{total}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}