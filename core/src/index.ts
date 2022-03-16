#!/usr/bin/env node
process.env.FAST_REFRESH = 'false';
process.env.BUILD_PATH = "dist"

import minimist from 'minimist';
import { BuildArgs } from 'kkt';
import { overridePaths } from 'kkt/lib/overrides/paths';
import { loaderConf } from "./overrides"

function help() {
  const { version } = require('../package.json');
  console.log('\n  Usage: \x1b[34;1mkkt-ssr\x1b[0m [build|watch] [--help|h]');
  console.log('\n  Displays help information.');
  console.log('\n  Options:\n');
  console.log('   --version, -v        ', 'Show version number');
  console.log('   --help, -h           ', 'Displays help information.');

  console.log('\n  Example:\n');
  console.log('   $ \x1b[35mkkt-ssr\x1b[0m build');
  console.log('   $ \x1b[35mkkt-ssr\x1b[0m watch');
  console.log(`\n  \x1b[34;1m@kkt/ssr\x1b[0m \x1b[32;1mv${version || ''}\x1b[0m\n`);
}

interface SSRNCCArgs extends BuildArgs {

}

(async () => {
  /**
   *   --- 目标
   * 1. 入口文件
   * 2. 出口文件
   * 3. 输出文件夹
   * 4. ts 还是 js
   * 5. sourceMap = false
   * 6. 进行 全量打包 还是使用 require 引入
   * css 文件抽离不需要打包到 server.js 中 ,或者使用 [isomorphic-style-loader](https://www.npmjs.com/package/isomorphic-style-loader) 进行转换
   * */

  /** 二次改造
   * 1. 支持多配置一起执行
   * 2. 只保留 build 和 watch 功能，
   * 3. 简化代码 和 配置
   * **/

  try {
    const args = process.argv.slice(2);
    const argvs: SSRNCCArgs = minimist(args);
    if (argvs.h || argvs.help) {
      return help();
    }
    if (argvs.v || argvs.version) {
      const { version } = require('../package.json');
      console.log(`\n \x1b[34;1m@kkt/ssr\x1b[0m \x1b[32;1mv${version || ''}\x1b[0m\n`);
      return;
    }
    const scriptName = argvs._[0];

    if (scriptName === 'build') {
      process.env.BABEL_ENV = 'production';
      process.env.NODE_ENV = 'production';
      (await import("./script/build")).default()
    } else if (scriptName === 'watch') {
      process.env.BABEL_ENV = 'development';
      process.env.NODE_ENV = 'development';
      (await import("./script/watch")).default()
    }
  } catch (error) {
    console.log('\x1b[31m KKT:SSR:ERROR:\x1b[0m', error);
  }
})();
