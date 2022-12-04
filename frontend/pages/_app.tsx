import type { AppProps } from "next/app";
import createEmotionCache from "../src/createEmotionCache";
import { EmotionCache } from "@emotion/cache";
import theme from "../src/theme";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import Head from "next/head";
import { CssBaseline } from "@mui/material";
import { createClient, WagmiConfig, chain, useContractEvent } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import toast, { Toaster } from "react-hot-toast";
import RailroadArtifact from "../contracts/Railroad.json";
import contractAddress from "../contracts/contract-address.json";

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
  useContractEvent({
    address: contractAddress.Railroad,
    abi: RailroadArtifact.abi,
    eventName: "Transfer",
    once: true,
    listener(from, to, tokenId) {
      toast.success(`Successfuly transferd`);
    },
  });
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
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
}
