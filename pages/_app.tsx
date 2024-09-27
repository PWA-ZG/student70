import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AppProps } from 'next/app';
import Head from 'next/head'; 

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        {/* PWA primary color */}
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
