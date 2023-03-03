# Vue3 Server Render 手把手帶你搭建

嗨～，大家好，我是前端工程師 Johnny，最近工作用 Nuxtjs 做了一些專案像是 `妖精尾巴官網` 和 `天涯明月刀預登頁` 後，覺得自己對整個 SSR 的構建流程似乎理解的沒有很透徹，決定自己動手試試從 0 搭建一個 Vue SSR 的專案試試，看能不能藉此提升一下對於 SSR 的構建理解狀況。

由於網路上大部分的教學目前都是圍繞著 Vue2 為基礎，為了增加樂趣（踩雷拉～～），本篇想嘗鮮以 Vue3 來實作看看，一些內容參考自網路上其他大大們的文章，希望也能幫助到大家加深理解 SSR

另外有些相關的套件仍在 alpha 階段，因此實際練習時，需要注意版本的差異喔，本篇主要依賴版本如下

#### dependencies
  - **vue**: v3.1.1
  - **vue-router**: v4.0.9
  - **vuex**: v4.0.1
  - **vue-meta**: v3.0.0-alpha.5(alpha.9 cjs 編譯輸出版本有 optional chaining 殘留會噴錯)
  - **express**: v4.17.1

#### dev-dependencies
  - **@vue/compiler-sfc**: v3.1.1(需跟 vue 版本一致)
  - **@vue/server-renderer**: v3.1.1(需跟 vue 版本一致)
  - **webpack**: v5.39.0
  - **vue-loader**: v16.2.0
  - **vue-style-loader**: v4.1.3
  - **css-loader**: v5.2.6

> Webpack 5 預設將不再包含一些 nodejs 依賴，例如 buffer, stream-browserify 等等，需要在 config 中另外處理 fallback。


## 專案環境架設

原本 Nuxtjs 在環境上似乎是用 rollup 進行編譯打包的工作，這篇為求方便直接 webpack 幹到底！～

開始之前，我們要先理清一下頭緒，我們的 webpack 需要區分為 client, server side 分別編譯我們的 entry-client, entry-server，其中 entry-client 是給 browser 讀的，而 entry-server 則是讓我們後面啟動 server 時讀取用的～

主要分為三隻 config
  - **base.config.js**:  
    client, server side 共用的一些 loader 設定等等
  - **client.config.js**:  
    client 端的配置，基本就跟平常的差不多
  - **server.config.js**:  
    server 端的配置，主要以 nodejs 讀取為主，本篇以 es6 module輸出使用

參考代碼如下：

1. #### base.config.js

```js
/**
 * Base Webpack config
 */
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const config = {
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: isProd, // extract css in production
        },
      },
      {
        test: /\.s?css$/,
        use: [
          // extract css in production
          isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              esModule: false, // css-loader > 5.0 use esModule by default
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              additionalData: '', // if you need any sass mixins can be put here
            },
          },
        ],
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimizer: [],
  },
};

// In Production
if (isProd) {
  config.plugins.push(new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[id].[contenthash].css',
  }));
  config.optimization.minimizer.push(new TerserPlugin());
}

module.exports = config;
```


2. #### client.config.js

```js
/**
 * Client Webpack config
 */
const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./base.config');

const config = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-client.js'),
  output: {
    path: path.resolve(__dirname, '../.ssr'),
    publicPath: '/.ssr/', // match static folder name which served by server
    filename: 'entry-client.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    // webpack 5 not includes these nodejs packages by default anymore
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
});

// html-webpack-plugin: inject our scripts and css files or style tags
config.plugins.push(new HtmlWebpackPlugin({
  template: path.resolve(__dirname, '../index.html'),
  filename: 'index.html',
  inject: 'body',
}));

module.exports = config;
```


3. #### server.config.js

```js
/**
 * Server Webpack config
 */
const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const baseConfig = require('./base.config');

const config = merge(baseConfig, {
  entry: path.resolve(__dirname, '../src/entry-server.js'),
  // output type "module" is still in experiments
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, '../.ssr'),
    filename: 'entry-server.js',
    library: {
      type: 'module', // esmodule
    },
  },
  target: 'node', // in node env
  node: {
    // tell webpack not to handle following
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals({
    // polyfill, .vue, .css
    allowlist: [
      /\.(css|sass|scss)$/,
      /\.(vue)$/,
      /\.(html)$/,
    ],
  })], // external node_modules deps
});

module.exports = config;
```

> 上面的 nodeExternal 是一個專門剔除 node_modules 依賴的套件

ok～，基本上主要就是透過 webpack 幫我們編譯兩份檔案出來，之後一份給 browser，一份給 server，接著我們來寫一下我們編譯前的 entry-client, entry-server, main.js 吧


## Entry files

在 SSR 的世界中，我們需要把一些實例化的過程放進一個產生器中，確保我們的每個 user 拿到的實例是全新的！首先來看看我們 main.js:

### main.js

```js
// use for ssr env
import { createSSRApp } from 'vue';
import App from './App.vue';
import { createMetaManager } from './meta';
import { createStore } from './store';
import { createRouter } from './router';

// createApp receives "isServer" to diff env
export function createApp({ isServer }) {
  const meta = createMetaManager();

  const store = createStore();

  const router = createRouter({ isServer });

  const app = createSSRApp(App);

  app.use(meta).use(store).use(router);

  // expose our instance for later render usage
  return { app, meta, store, router };
}
```

我們在 main.js 中定義一個函數，用來產生各種實例化所有常見的相關套件，並且輸出他們，提供後續渲染配置。

注意喔～，這邊不會立即執行 `mount` 的動作，我們將 `mount` 移轉到 entry-client 幫忙執行，為了確保 main.js 可以被 server 正確取用，這也是為何我們的 mounted, beforeMount 等生命週期不會在 server side 觸發執行的原因。

接著完成所有插件配置：

1. #### vue-router

```js
import { createRouter as _createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import ViewHome from './views/Home.vue';
import ViewAbout from './views/About.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ViewHome,
  },
  {
    path: '/about',
    name: 'About',
    component: ViewAbout,
  },
];

export function createRouter({ isServer }) {
  return _createRouter({
    // diff from server and client
    history: isServer
      ? createMemoryHistory()
      : createWebHistory(),
    routes,
  })
};
```

2. #### vuex

```js
import { createStore as _createStore } from 'vuex';

export function createStore() {
  return _createStore({
    strict: true,
  });
};
```


3. #### vue-meta

```js
import { createMetaManager as _createMetaManager } from 'vue-meta';

export function createMetaManager() {
  return _createMetaManager();
}
```

4. #### App.vue

這邊需要注意，新版的 vue-meta 寫法可能不同，這邊是以當下版本來寫，因為 vue-meta 使用到 vue3  的 teleport，必須用 div 包起來不然會出現問題，並且這邊只希望 client 端渲染就好因此簡單包裹如下。

```html
<template>
  <div v-if="inClient">
    <metainfo></metainfo>
  </div>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'App',
  data() {
    return {
      inClient: false,
    }
  },
  mounted() {
    console.log(this.$store); // test to see if store init correctly
    this.inClient = true;
  },
  setup () {
    useMeta({
      title: 'My Default App',
      htmlAttrs: {
        lang: 'en',
      },
    })
  },
};
</script>

<style lang="scss">
#app {
  font-size: 16px;
}
</style>
```

5. #### Home.vue

接著我們來建立兩個簡單的 page 互相跳轉一下，看看 meta 有沒有正確～

```html
<template>
  <div class="view-home">
    {{ msg }}
    <router-link to="/about">To About</router-link>
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'ViewHome',
  data() {
    return {
      msg: 'Hello World',
    }
  },
  setup () {
    const { meta } = useMeta({
      title: 'My Default App - Home',
    })
  },
};
</script>

<style lang="scss">
.view-home {
  color: red;
}
</style>
```

6. #### About.vue

```html
<template>
  <div class="view-about">
    {{ msg }}
    <router-link to="/">To Home</router-link>
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'ViewAbout',
  data() {
    return {
      msg: 'Hello About',
    }
  },
  setup () {
    const { meta } = useMeta({
      title: 'My Default App - About',
    })
  },
};
</script>

<style lang="scss">
.view-about {
  color: blue;
}
</style>
```


### entry-client.js

接著看看 entry-client:

```js
import { createApp } from './main';

// open an async
(async () => {
  console.log('pass client');
  const { app, router } = createApp({ isServer: false });

  // wait for router ready
  await router.isReady();
  
  // mount to our app wrapper
  app.mount('#__maju');
})();
```

entry-client 中主要就是把本來在 client 中的初始動作完成

### entry-server.js

接著看看 entry-server

```js
import { createApp } from './main';

// context will be injected by our server
export default async function serverEntry(context) {
  console.log('pass server');
  const { app, router, store, meta } = createApp({ isServer: true });

  // set server-side router's location
  router.push(context.url);

  // bind instance to context
  context.meta = meta;
  context.store = store;

  // wait for router ready
  await router.isReady();

  const matchedComponents = router.currentRoute.value.matched;
  // no matched routes, pass with next()
  if (!matchedComponents.length) {
    // error 404 or pass to other middleware
    context.next();
  }

  // the Promise should resolve to the app instance so it can be rendered
  return app;
}
```

entry-server 中我們會幫助 vue-router 跳轉至指定的 url 位置，這步驟在 client side 會自動完成，但 server 端需要手動處理，並且把一些實例掛載到我們的 context 中供後續 server 其他的 middleware 使用（這篇沒有實作 middleware 在 server 中～）

等待 router 初始完成後就可以將 app instance 回傳給 server 進行下一步的渲染摟。



## Server for rendering

接著實作重頭戲的 server 本人！我們需要在 server 中完成幾件事情：

  - 啟動 server
  - serve 靜態檔案在 .ssr
  - 編譯渲染 app 並組合 meta tags 成 html string
  - 最後回傳 html string

其中編譯渲染的過程比較長，我們另外拉出一隻 compile.js 來處理

### server.js

```js
import path from 'path';
import express from 'express';
import compileServer from './compile';

// create express server
const server = express();

// serve static files in .ssr folder
server.use('/.ssr', express.static(path.join(__dirname, '../.ssr')));

// compile server html and serve
compileServer(server);

// listen port
const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Vue3 SSR server at port: ${port}`));
```


### compile.js

```js
import fs from 'fs';
import path from 'path';
import { renderToString } from '@vue/server-renderer';
import serverEntry from '../.ssr/entry-server.js'; // import out compiled server entry

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

  // index.html injected with entry-client.js and css files
  const wrapper = fs.readFileSync(
    path.join(__dirname, '../.ssr/index.html'),
    'utf-8',
  );

  // replace meta tags in template
  return wrapper
    .replace('{{ HTML_ATTRS }}', ctx.teleports.htmlAttrs || '')
    .replace('{{ HEAD_ATTRS }}', ctx.teleports.headAttrs || '')
    .replace('{{ HEAD }}', ctx.teleports.head || '')
    .replace('{{ BODY_ATTRS }}', ctx.teleports.bodyAttrs || '')
    .replace('{{ APP }}', `<div id="__maju">${appHtml}</div>`);
}

export default function compileServer(serverApp) {
  serverApp.get('*', async (req, res, next) => {
    // context
    const context = {
      url: req.url,
      next,
    };

    // init app instance
    const app = await serverEntry(context);
  
    // render app to html
    const html = await renderWithMeta(app);

    // return
    res.end(html);
  })
}
```

以上就大功告成拉～～，最後我們需要指令來啟動，改一下 package.json 如下

為了同時編譯與啟動 server，我們需要安裝一個套件 `concurrently`。

```json
{
  "scripts": {
    "dev": "concurrently 'pnpm dev:client' 'pnpm dev:server' 'pnpm start'",
    "dev:client": "cross-env NODE_ENV=development webpack --watch --config config/client.config.js",
    "dev:server": "cross-env NODE_ENV=development webpack --watch --config config/server.config.js",
    "build": "pnpm build:client && pnpm build:server",
    "build:client": "cross-env NODE_ENV=production webpack --config config/client.config.js",
    "build:server": "cross-env NODE_ENV=production webpack --config config/server.config.js",
    "start": "nodemon --watch .ssr/entry-server.js --exec 'babel-node config/server.js'"
  },
}
```

最後打開終端機輸入 `npm run dev` 就會看到到我們的 ssr server 摟～


## 結論

光是把基本配置搞好還沒開發就快搞死人了，真的是要感謝 Nuxt 團隊的努力啊～，不然每次配置 SSR 專案都要這樣折騰一次實在是不行

以上就是本次花了一整個禮拜的下班時間研究出的結果拉～希望大家會喜翻，[source code在此]()，歡迎有興趣看看的大大們下載來玩玩，別忘了順手幫我點個讚喔，感恩拉！！～



## 參考
1. [Vue3 Server-Side Rendering Guide](https://v3.vuejs.org/guide/ssr/introduction.html)
2. [手把手建立Vue-SSR開發環境](https://devs.tw/post/190)
3. [Vue Router - api](https://next.router.vuejs.org/api/)
4. [Vue meta](https://github.com/nuxt/vue-meta)
