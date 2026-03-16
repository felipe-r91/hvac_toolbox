import { usePwaUpdater } from "../hooks/usePWAupdater";

export function SyncPage() {
  const {
    offlineReady,
    needRefresh,
    updateApp,
    dismissOfflineReady,
    dismissNeedRefresh,
  } = usePwaUpdater();

  return (
    <section className="space-y-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Sync Data</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload offline maintenance data and keep the app updated.
        </p>
      </section>

      {needRefresh ? (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">New app version available</h2>
          <p className="mt-1 text-sm text-slate-500">
            A newer production version is available. Update when you are not editing a report.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={updateApp}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Update app
            </button>

            <button
              type="button"
              onClick={dismissNeedRefresh}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
            >
              Later
            </button>
          </div>
        </section>
      ) : null}

      {offlineReady ? (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Offline mode ready</h2>
          <p className="mt-1 text-sm text-slate-500">
            This device is ready to use the app offline.
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={dismissOfflineReady}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              OK
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}