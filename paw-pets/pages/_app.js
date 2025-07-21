"use client"
import { useState } from 'react';
import Head from 'next/head';
import { AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Fredoka } from '@next/font/google';
import { AppKitProvider } from '../util/web3Config';

const fredoka = Fredoka({ subsets: ['latin'] });

export const GameContext = createContext();

export default function App({ Component, pageProps }) {
  const [Volume, setVolume] = useState(.5)
  const [BGMVolume, setBGMVolume] = useState(.2)
  
  return <>
    <Head>
      <meta name="description" content="Paw Pets is a cozy cat web application to help you feel at ease. Meow meow." />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      <meta content="/icons/advisor.svg" property='og:image' />
      <meta property="og:description" content="Paw Pets is a cozy cat web application to help you feel at ease. Meow meow." />
      <link rel="icon" href="/icons/advisor_icon.svg" />
      <meta name="theme-color" content="#FEF9ED" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Head>
    <style jsx global>{`
        html, button, ::placeholder, input {
          font-family: ${fredoka.style.fontFamily};
        }
      `}</style>

    <AppKitProvider>
      <GameContext.Provider value={{ Volume, setVolume, BGMVolume, setBGMVolume }}>
        <LazyMotion features={domMax} strict>
          <AnimatePresence mode="wait" initial={false}>
            <Component {...pageProps} />
          </AnimatePresence>
        </LazyMotion>
      </GameContext.Provider>
    </AppKitProvider>

    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: '16px',
          background: '#fff7e6',
          color: '#ffb347',
          fontWeight: 'bold',
          fontFamily: 'Comic Sans MS, Comic Sans, cursive',
          boxShadow: '0 4px 16px rgba(255,179,71,0.15)',
          border: '2px solid #ffb347',
          padding: '1em 1.5em',
          fontSize: '1.1em'
        },
        iconTheme: {
          primary: '#ffb347',
          secondary: '#fff7e6',
        },
      }}
    />

  </>
}
