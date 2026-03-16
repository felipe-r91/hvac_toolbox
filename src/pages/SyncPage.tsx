import { usePwaUpdater } from "../hooks/usePwaUpdater";

export function SyncPage() {
  const { needRefresh, updateApp } = usePwaUpdater();

  return (
    <section className="space-y-4">

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <h2 className="text-lg font-semibold text-slate-900">
          Application
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Version {__APP_VERSION__}
        </p>

        {needRefresh && (
          <div className="mt-4 rounded-2xl bg-yellow-100 p-4 text-sm text-yellow-900">
            New version available.
          </div>
        )}

        <button
          onClick={updateApp}
          className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Update application
        </button>

      </div>

    </section>
  );
}