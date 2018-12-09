import React from 'react';
import './Document.css';

function InitData({ data }) {
  if (!data) return null;
  let JSSTR = null;
  try {
    JSSTR = JSON.stringify(data);
  } catch (error) { } // eslint-disable-line
  if (JSSTR === null) return null;
  return (
    <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `window._KKT_SSR = ${JSSTR};` }}/>
  );
}

function InitStore({ data }) {
  if (!data) return null;
  let JSSTR = null;
  try {
    JSSTR = JSON.stringify(data);
  } catch (error) { } // eslint-disable-line
  if (!JSSTR) return;
  return (
    <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `window._KKT_STORE = ${JSSTR};` }} />
  );
}

export class Document extends React.Component {
  static async getInitialProps({ assets, data, extractor, renderPage, store }) {
    const page = await renderPage();
    return { assets, data, extractor, store, ...page };
  }
  render() {
    // eslint-disable-next-line
    const { helmet, assets, preloadAssets, data, store } = this.props;
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();
    return (
      <html lang="en" {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {preloadAssets.css && preloadAssets.css.map((csspath, key) => <link key={key} rel="stylesheet" href={csspath} />)}
        </head>
        <body {...bodyAttrs}>
          <div id="root">___SERVER_SSR_RENDER___</div>
          <InitData data={data} />
          {store && store.getState && <InitStore data={store.getState()} />}
          {preloadAssets.js && preloadAssets.js.map((jspath, key) => <script key={key} type="text/javascript" src={jspath} />)}
          <script type="text/javascript" src={assets.client.js} async />
        </body>
      </html>
    );
  }
}