import { usePwaUpdater } from "../hooks/usePwaUpdater";

export function PwaUpdatePrompt() {
  const {
    needRefresh,
    offlineReady,
    updateApp,
    dismissUpdate,
    dismissOfflineReady,
  } = usePwaUpdater();

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
      {needRefresh ? (
        <>
          <h2 className="text-base font-semibold text-slate-900">
            New version available
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A newer version of the app is ready. Update now?
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={updateApp}
              className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Update now
            </button>

            <button
              type="button"
              onClick={dismissUpdate}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300"
            >
              Later
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold text-slate-900">
            Offline mode ready
          </h2>
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
        </>
      )}
    </div>
  );
}