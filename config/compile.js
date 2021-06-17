const fs = require('fs');
const path = require('path');
const { renderToString } = require('@vue/server-renderer');
const serverEntry = require('../.ssr/entry-server.js').default;

/**
 * renderMetaToString
 * @param {vue app instance} app 
 * @returns 
 */
async function renderMetaToString(app) {
  const ctx = {};
  const appHtml = await renderToString(app, ctx);
  if (!ctx.teleports || !ctx.teleports.head) {
    const teleports = app.config.globalProperties.$metaManager.render();
    await Promise.all(teleports.map((teleport) => renderToString(teleport, ctx)));
  }

  const { teleports } = ctx;
  for (const target in teleports) {
    if (target.endsWith('Attrs')) {
      const str = teleports[target];
      // match from first space to first >, these should be all rendered attributes
      teleports[target] = str.slice(str.indexOf(' ') + 1, str.indexOf('>'));
    }
  }

  return [appHtml, ctx];
}

/**
 * renderWithMeta
 * @param {vue app instance} app
 * @returns {html string}
 */
async function renderWithMeta(app) {
  const [appHtml, ctx] = await renderMetaToString(app);

  const wrapper = fs.readFileSync(
    path.join(__dirname, '../.ssr/index.html'),
    'utf-8',
  );

  return wrapper
    .replace('{{ HTML_ATTRS }}', ctx.teleports.htmlAttrs || '')
    .replace('{{ HEAD_ATTRS }}', ctx.teleports.headAttrs || '')
    .replace('{{ HEAD }}', ctx.teleports.head || '')
    .replace('{{ BODY_ATTRS }}', ctx.teleports.bodyAttrs || '')
    .replace('{{ APP }}', `<div id="__maju">${appHtml}</div>`)
}

module.exports = function compileServer(serverApp) {
  serverApp.get('*', async (req, res, next) => {
    const context = {
      url: req.url,
      next,
    };

    const app = await serverEntry(context);
  
    const html = await renderWithMeta(app);
  
    res.end(html);
  })
}
