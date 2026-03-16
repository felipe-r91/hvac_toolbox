import { registerSW } from "virtual:pwa-register";

export function usePwaUpdater() {
  let updateAvailable = false;

  const updateSW = registerSW({
    onNeedRefresh() {
      updateAvailable = true;
    },
  });

  function updateApp() {
    updateSW(true);
  }

  return {
    updateAvailable,
    updateApp,
  };
}