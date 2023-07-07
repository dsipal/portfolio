import React from "react";


export const Hero = ({title, image}) => {
    return (
      <div
        id="banner"
        className="h-[25vh] bg-slate-600 bg-cover bg-blend-soft-light mb-5 block text-white flex items-center justify-center"
        style={{backgroundImage: "url(" + image + ")"}}>
        <h1 className="grid text-center text-5xl font-bold drop-shadow-lg pt-5">
          {title}
        </h1>
      </div>
    );
};

