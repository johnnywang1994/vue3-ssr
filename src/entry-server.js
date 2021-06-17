// import { renderToString } from '@vue/server-renderer';
// import { renderMetaToString } from 'vue-meta/ssr';
import { createApp } from './main';

export default async function serverEntry(context) {
  const { app, router } = createApp({ isServer: true });

  // set server-side router's location
  router.push(context.url);

  await router.isReady();

  const matchedComponents = router.currentRoute.value.matched;
  // no matched routes, pass with next()
  if (!matchedComponents.length) {
    // TODO: error 404
    context.next();
  }

  // the Promise should resolve to the app instance so it can be rendered
  return app;
}
