import React from "react";
import Link from "next/link";
import NextImage from "./image";

const Card = ({ post }) => {
  return (

    <div className="card card-muted">
      <div className="card-body">
        <p id="category">
          <Link href={`/category/${post.attributes.category.data.attributes.slug}`}>
            {post.attributes.category.data.attributes.title}
          </Link>
        </p>
        <h3 id="title">
          <Link href={`/post/${post.attributes.slug}`}>
            {post.attributes.title}
          </Link>
        </h3>
        <p>
        {post.attributes.description}
        </p>
      </div>
    </div>

  );
};

export default Card;