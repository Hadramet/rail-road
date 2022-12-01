import * as React from 'react'
import type { AppProps } from 'next/app'
import createEmotionCache from '../src/createEmotionCache'
import { EmotionCache } from '@emotion/cache'
import theme from '../src/theme'
import { CacheProvider, ThemeProvider } from '@emotion/react'
import Head from 'next/head'
import { CssBaseline } from '@mui/material'

const clientSideEmotionCache = createEmotionCache()

interface RailroadProps extends AppProps {
  emotionCache?: EmotionCache
}


export default function App(props: RailroadProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
