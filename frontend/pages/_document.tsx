import * as React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import createEmotionCache from "../src/createEmotionCache";
import createEmotionServer from "@emotion/server/create-instance";
import theme, { roboto } from "../src/theme";

class RailroadDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en" className={roboto.className}>
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="shortcut icon" href="/static/favicon.io" />
          <meta name="emotion-insertion-point" content="" />
          {(this.props as any).emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

RailroadDocument.getInitialProps = async (ctx) => {
  const initialRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    initialRenderPage({
      enhanceApp: (App: any) =>
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => {
    <style
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />;
  });

  return {
    ...initialProps,
    emotionStyleTags,
  };
};

export default RailroadDocument;
