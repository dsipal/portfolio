import React from "react";
import Card from "./card";

const Posts = ({ posts }) => {

  return (
    <div>
      <div className="uk-child-width-1-1@s" data-uk-grid="true">
        <div>
          <div className="uk-child-width-1-1@m uk-grid-match" data-uk-grid>
            {posts.map((post, i) => {
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