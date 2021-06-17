import { createApp } from './main';

(async () => {
  const { app, router } = createApp({ isServer: false });

  await router.isReady();
  
  app.mount('#__maju');
})();
