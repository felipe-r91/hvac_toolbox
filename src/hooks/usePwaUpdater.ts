import { useRegisterSW } from "virtual:pwa-register/react";

export function usePwaUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return;

      // Check periodically for a new Netlify deployment while the app is open
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    },
  });

  return {
    needRefresh,
    offlineReady,
    updateApp: () => updateServiceWorker(true),
    dismissUpdate: () => setNeedRefresh(false),
    dismissOfflineReady: () => setOfflineReady(false),
  };
}