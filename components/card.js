import React from "react";
import Link from "next/link";
import NextImage from "./image";
import Moment from 'react-moment';

const Card = ({ post }) => {
  return (
    <article className="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 mt-5">
      <div className="flex justify-between items-center mb-5 text-gray-500">
        <Link
          href={`/category/${post.attributes.category.data.attributes.slug}`}
          id="card-category"
        >
          {post.attributes.category.data.attributes.title}
        </Link>
        <Moment fromNow className="bg-primary-100 text-primary-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">{post.attributes.publishedAt}</Moment>
      </div>
      <h3
        id="title"
        className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
      >
        <Link href={`/post/${post.attributes.slug}`}>
          {post.attributes.title}
        </Link>
      </h3>

      <p className="mb-5 font-light text-gray-500 dark:text-gray-400">
        {post.attributes.description}
      </p>
    </article>
  );
};

export default Card;