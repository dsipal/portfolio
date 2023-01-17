import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html className="dark">
        <Head>
          {/* eslint-disable-next-line */}
        </Head>
        <body className="bg-white dark:bg-gray-900 text-black dark:text-white transition-all ease-in-out">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;