import React from "react";


export const Hero = ({title, image}) => {
    return (
      <div
        id="banner"
        className="h-[40vh] mb-5 block text-white"
        style={{backgroundImage: "url(" + image + ")"}}>
        <h1 className="text-center text-5xl font-bold drop-shadow-lg pt-5">
          {title}
        </h1>
      </div>
    );
};

