import React from "react";
import Card from "./card";

const Posts = ({ posts }) => {
  return (
    <div className="mx-auto max-w-5xl p-5">
      {posts.map((post, i) => {
        return <Card post={post} key={`post__${post.attributes.published_date}`} />;
      })}
    </div>
  );
};

export default Posts;
