import React from "react";
import Card from "./card";

const Posts = ({ posts }) => {
  return (
    <div className="relative">
      {posts.map((post, i) => {
        return <Card post={post} key={`post__${post.attributes.slug}`} />;
      })}
    </div>
  );
};

export default Posts;
