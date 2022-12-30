import React from "react";
import Card from "./card";

const Posts = ({ posts }) => {
  const leftPostsCount = Math.ceil(posts.length / 5);
  const leftPosts = posts.slice(0, leftPostsCount);
  const rightPosts = posts.slice(leftPostsCount, posts.length);
  console.log(leftPostsCount)
  console.log(rightPosts)
  return (
    <div>
      <div className="uk-child-width-1-2@s" data-uk-grid="true">
        <div>
          {leftPosts.map((post, i) => {
            return (
              <Card
                post={post}
                key={`post__left__${post.attributes.slug}`}
              />
            );
          })}
        </div>
        <div>
          <div className="uk-child-width-1-2@m uk-grid-match" data-uk-grid>
            {rightPosts.map((post, i) => {
              return (
                <Card
                  post={post}
                  key={`post__left__${post.attributes.slug}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;