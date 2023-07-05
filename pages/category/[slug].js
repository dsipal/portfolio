import Seo from "../../components/seo";
import Layout from "../../components/layout";
import Posts from "../../components/posts";

import { fetchAPI } from "../../lib/api";

const Category = ({ category, categories }) => {
  const seo = {
    metaTitle: category.attributes.title,
    metaDescription: `All ${category.attributes.title} posts`,
  };

  return (
    <Layout categories={categories.data}>
      <Seo seo={seo} />
      <div className="justify-center align-center text-center mb-10">
        <h1 className="category-header text-7xl">{category.attributes.title}</h1>
      </div>
      <Posts posts={category.attributes.posts.data} />
    </Layout>
  );
};

export async function getStaticPaths() {
  const categoriesRes = await fetchAPI("/categories", { fields: ["slug"] });

  return {
    paths: categoriesRes.data.map((category) => ({
      params: {
        slug: category.attributes.slug,
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const matchingCategories = await fetchAPI("/categories", {
    filters: { slug: params.slug },
    populate: "shareImage",
    populate: {
      posts: {
        populate: "*",
      },
    },
  });
  const allCategories = await fetchAPI("/categories");

  return {
    props: {
      category: matchingCategories.data[0],
      categories: allCategories,
    },
    revalidate: 1,
  };
}

export default Category;
