import { createSSRApp } from 'vue';
import App from './App.vue';
import { createMetaManager } from './meta';
import { createStore } from './store';
import { createRouter } from './router';

export function createApp({ isServer }) {
  const meta = createMetaManager();

  const store = createStore();

  const router = createRouter({ isServer });

  const app = createSSRApp(App);

  app.use(meta).use(store).use(router);

  return { app, meta, store, router };
}
