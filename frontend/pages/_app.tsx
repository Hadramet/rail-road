import type { AppProps } from "next/app";
import createEmotionCache from "../src/createEmotionCache";
import { EmotionCache } from "@emotion/cache";
import theme from "../src/theme";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import Head from "next/head";
import { CssBaseline } from "@mui/material";
import { createClient, WagmiConfig, chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { RailroadBar } from "../components/RailroadBar";
import { Toaster } from "react-hot-toast";

const clientSideEmotionCache = createEmotionCache();
const chains = [chain.localhost, chain.hardhat, chain.goerli]; //more chain here
const client = createClient(
  getDefaultClient({
    appName: "Railroad",
    chains,
  })
);

interface RailroadProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function App(props: RailroadProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
          </Head>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster position="top-center" />
            <RailroadBar />
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
