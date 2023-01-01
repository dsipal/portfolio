/* eslint-disable react/no-children-prop */
import Moment from "react-moment";
import ReactMarkdown from "react-markdown";

import Seo from "../../components/seo";
import Layout from "../../components/layout";

import { fetchAPI } from "../../lib/api";
import { getStrapiMedia } from "../../lib/media";

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
        className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
        data-src={imageUrl}
        data-srcset={imageUrl}
        data-uk-img
      >
        <h1>{post.attributes.title}</h1>
      </div>
      <div className="uk-section">
        <div className="uk-container uk-container-small">
          
          <ReactMarkdown children={post.attributes.content}/>
          <hr className="uk-divider-small" />
          <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
            <div className="uk-width-expand">
              <p className="uk-text-meta uk-margin-remove-top">
                <Moment format="MMM Do YYYY">
                  {post.attributes.published_at}
                </Moment>
              </p>
            </div>
          </div>
        </div>
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