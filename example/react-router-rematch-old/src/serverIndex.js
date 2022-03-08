import express from 'express';
import cookieParser from 'cookie-parser';
import proxy from 'http-proxy-middleware';
import { render } from '@kkt/react-ssr-enhanced';
import { getRouterData } from './routes';
import { createStore } from './store';
import Path from 'path';
import FS from 'fs';

// const assets = require(process.env.KKT_ASSETS_MANIFEST); // eslint-disable-line

// require 方式 打包报错
const assetsMainifest = new Function(`return ${FS.readFileSync(`${OUTPUT_PUBLIC_PATH}/asset-manifest.json`, "utf-8")}`)()

const appDirectory = FS.realpathSync(process.cwd());
const resolveApp = (relativePath) => Path.resolve(appDirectory, relativePath);

// const assets = {}

// if (assetsMainifest && assetsMainifest["entrypoints"]) {
//   Object.values(assetsMainifest.entrypoints).forEach((item) => {
//     if (/.css$/.test(item)) {
//       assets.css = item
//     }
//     if (/.js$/.test(item)) {
//       assets.js = item
//     }
//   })
// }


const routes = getRouterData();
const server = express();

server.disable('x-powered-by');
// API request to pass cookies
// `getInitialProps` gets the required value via `req.cookies.token`
server.use(cookieParser());
server.use(express.static(resolveApp('dist')));
server.use('/api', proxy({
  target: `http://${process.env.HOST}:3724`,
  changeOrigin: true,
}));
server.get('/*', async (req, res) => {
  const store = await createStore();
  try {
    const html = await render({
      req,
      res,
      routes,
      assets: assetsMainifest,
      store, // This Redux
    });
    res.send(html);
  } catch (error) {
    // eslint-disable-next-line
    console.log('html---server--error>>>>:', error);
    res.json(error);
  }
});

export default server;