import React from "react";
import Link from "next/link";
import NextImage from "./image";

const Card = ({ post }) => {
  return (

    <div className="card card-muted">
      <div className="card-body">
        <h3 id="title">
          <Link href={`/post/${post.attributes.slug}`}>
            {post.attributes.title}
          </Link>
        </h3>
        <Link href={`/category/${post.attributes.category.data.attributes.slug}`} id="card-category">
            {post.attributes.category.data.attributes.title}
          </Link>
        <p>
        {post.attributes.description}
        </p>
      </div>
    </div>

  );
};

export default Card;