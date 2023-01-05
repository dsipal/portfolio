/* eslint-disable react/no-children-prop */
import Moment from "react-moment";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';

import Seo from "../../components/seo";
import Layout from "../../components/layout";

import { fetchAPI } from "../../lib/api";
import { getStrapiMedia } from "../../lib/media";

import {CodeBlock} from "../../components/code-block.js"

const Post = ({ post, categories }) => {
  const imageUrl = getStrapiMedia(post.attributes.cover);

  const seo = {
    metaTitle: post.attributes.title,
    metaDescription: post.attributes.description,
    shareImage: post.attributes.cover,
    post: true,
  };

  return (
    <Layout categories={categories.data}>
      <Seo seo={seo} />
      <div
        id="banner"
        className="hero"
        data-src={imageUrl}
        data-srcset={imageUrl}
        data-uk-img
      >
        <h1 className="text-center text-5xl text-white font-bold drop-shadow-lg pt-5">{post.attributes.title}</h1>
      </div>
      <div className="container m-auto">
        <ReactMarkdown 
        rehypePlugins={[rehypeRaw]}
        components={CodeBlock}
        escapeHtml={false}
        children={post.attributes.content}
        />
        <hr className="" />
        <p className="">
          <Moment format="MMM Do YYYY">{post.attributes.published_at}</Moment>
        </p>
      </div>
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
    populate: ["cover", "category"],
  });
  const categoriesRes = await fetchAPI("/categories");

  return {
    props: { post: postsRes.data[0], categories: categoriesRes },
    revalidate: 1,
  };
}

export default Post;