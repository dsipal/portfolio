/* eslint-disable react/no-children-prop */
import Moment from "react-moment";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';

import Seo from "../../components/seo";
import Layout from "../../components/layout";

import { fetchAPI } from "../../lib/api";
import { getStrapiMedia } from "../../lib/media";

import {CodeBlock} from "../../components/code-block.js";
import {Hero} from "../../components/hero.js";

const Post = ({ post, categories }) => {
  const imageUrl = getStrapiMedia(post.attributes.postHero);
  const seo = {
    pageTitle: post.attributes.title,
    metaDescription: post.attributes.description,
    shareImage: post.attributes.cover,
    post: true,
  };

  return (
    <Layout categories={categories.data}>
      <Seo seo={seo} />

      <Hero image={imageUrl} title={post.attributes.title} />

      <article
        className="p-5 m-auto [&>*>a]:text-orange-400 
      dark:[&>*>a]:text-cyan-400 mb-10 max-w-5xl font-body"
      >
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={CodeBlock}
        >
          {post.attributes.content}
        </ReactMarkdown>
        <p className="text-right mr-5 mt-5 overline">
          <Moment format="MMM Do YYYY">{post.attributes.published_date}</Moment>
        </p>
      </article>
    </Layout>
  );
};

export async function getStaticPaths() {
  const postsRes = await fetchAPI("/posts", { fields: ["slug"] });

  return {
    paths: postsRes.data.map((post) => ({
      params: {
        slug: post.attributes.slug,
      },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postsRes = await fetchAPI("/posts", {
    filters: {
      slug: params.slug,
    },
    populate: ["cover", "category", "postHero"],
  });
  const categoriesRes = await fetchAPI("/categories");
  return {
    props: { post: postsRes.data[0], categories: categoriesRes},
    revalidate: 1,
  };
}

export default Post;
