import { useState } from "react";
import { registerSW } from "virtual:pwa-register";

export function usePwaUpdater() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  const updateSW = registerSW({
    onOfflineReady() {
      setOfflineReady(true);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onRegistered(registration) {
      if (!registration) return;

      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    },
  });

  return {
    offlineReady,
    needRefresh,
    updateApp: () => updateSW(true),
    dismissOfflineReady: () => setOfflineReady(false),
    dismissNeedRefresh: () => setNeedRefresh(false),
  };
}