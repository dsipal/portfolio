import React from "react";
import Link from "next/link";
import NextImage from "./image";

const Card = ({ post }) => {
  console.log(post)
  return (
    <Link href={`/article/${post.attributes.slug}`}>
      <div className="uk-card uk-card-muted">
        <div className="uk-card-media-top">
          <NextImage image={post.attributes.cover} />
        </div>
        <div className="uk-card-body">
          <p id="category" className="uk-text-uppercase">
            
            {post.attributes.category.data.attributes.title}
          </p>
          <p id="title" className="uk-text-large">
            {post.attributes.title}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Card;