import { createApp } from './main';

(async () => {
  console.log('pass client');
  const { app, router } = createApp({ isServer: false });

  await router.isReady();
  
  app.mount('#__maju');
})();
