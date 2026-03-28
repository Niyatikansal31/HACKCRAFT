import { registerSW } from 'virtual:pwa-register';

export function registerAidServiceWorker() {
  if (import.meta.env.DEV) return;

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
  });
}
