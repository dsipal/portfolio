import App from "next/app";
import Head from "next/head";
import Script from 'next/script';
import { createContext } from "react";
import { fetchAPI } from "../lib/api";
import * as gtag from "../lib/gtag";
import { getStrapiMedia } from "../lib/media";
import React, { useState } from 'react';
import { ThemeProvider } from "next-themes";

//import stylesheets
import styles from '/styles/globals.scss';
import prism from '/styles/prism-onedark.css';

// Store Strapi Global object in context
export const GlobalContext = createContext({});

//GA env var
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

const MyApp = ({ Component, pageProps }) => {
  const { global } = pageProps;
  return (
    <ThemeProvider defaultTheme="dark" attribute="class" themes={["dark", "light"]}>
      <GlobalContext.Provider value={global.attributes}>
        <Head>
          <link
            rel="shortcut icon"
            href={getStrapiMedia(global.attributes.favicon)}
          />
        </Head>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></Script>
        <Script id="GA">
          {
          `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
          `
          }
        </Script>

        <Component {...pageProps} />
      </GlobalContext.Provider>
    </ThemeProvider>
  );
};

// getInitialProps disables automatic static optimization for pages that don't
// have getStaticProps. So article, category and home pages still get SSG.
// Hopefully we can replace this with getStaticProps once this issue is fixed:
// https://github.com/vercel/next.js/discussions/10949
MyApp.getInitialProps = async (ctx) => {
  // Calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(ctx);
  // Fetch global site settings from Strapi
  const globalRes = await fetchAPI("/global", {
    populate: {
      favicon: "*",
      defaultSeo: {
        populate: "*",
      },
    },
  });
  // Pass the data to our page via props
  return { ...appProps, pageProps: { global: globalRes.data } };
};

export default MyApp;