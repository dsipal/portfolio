import React from "react";
import Posts from "../components/posts";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";
import Cubes from "../components/cubes";

const Home = ({ posts, categories}) => {
  //TODO: set this up to get pageTitle from strapi somehow.
  const seo = {
    pageTitle: "home"
  }
  return (
    <Layout categories={categories}>
      <Seo seo={seo}/>
      <div id="decor" className="max-h-[50vh] max-w-[50vh] mx-auto display-block">
        <Cubes />
      </div>

      <Posts posts={posts} className="" />
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [postsRes, categoriesRes] = await Promise.all([
    fetchAPI("/posts", { populate: ["cover", "category"], sort: "published_date:DESC"}),
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
