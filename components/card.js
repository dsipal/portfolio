import React from "react";
import Link from "next/link";
import NextImage from "./image";

const Card = ({ post }) => {
  return (

    <div className="uk-card uk-card-muted">
      <div className="uk-card-media-top">
        <Link href={`/post/${post.attributes.slug}`}>
          <NextImage image={post.attributes.cover} />
        </Link>
      </div>
      <div className="uk-card-body">
        <p id="category" className="uk-text-uppercase">
          <Link href={`/category/${post.attributes.category.data.attributes.slug}`}>
            {post.attributes.category.data.attributes.title}
          </Link>
        </p>
        <p id="title" className="uk-text-large">
          <Link href={`/post/${post.attributes.slug}`}>
            {post.attributes.title}
          </Link>
        </p>
      </div>
    </div>

  );
};

export default Card;