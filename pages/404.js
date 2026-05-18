import Link from "next/link";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";

const NotFound = ({ categories }) => {
  const seo = { pageTitle: "404 — Page Not Found" };
  return (
    <Layout categories={categories}>
      <Seo seo={seo} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <p className="text-2xl font-semibold mt-4 dark:text-white">Page not found</p>
        <p className="text-gray-500 mt-2 mb-8">
          That page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold hover:opacity-80 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  try {
    const categoriesRes = await fetchAPI("/categories", {});
    return { props: { categories: categoriesRes.data } };
  } catch {
    return { props: { categories: [] } };
  }
}

export default NotFound;
