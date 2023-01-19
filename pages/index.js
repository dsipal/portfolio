import React from "react";
import Posts from "../components/posts";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";
import Cubes from "../components/cubes";

const Home = ({ posts, categories}) => {
  return (
    <Layout categories={categories}>
      <div id="decor" className="max-h-[50vh] max-w-[50vh]">
        <Cubes />
      </div>

      <Posts posts={posts} className="mb-20" />
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [postsRes, categoriesRes] = await Promise.all([
    fetchAPI("/posts", { populate: ["cover", "category"] }),
    fetchAPI("/categories", { populate: "*" }),
  ]);

  return {
    props: {
      posts: postsRes.data,
      categories: categoriesRes.data,
    },
    revalidate: 1,
  };
}

export default Home;