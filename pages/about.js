import React from "react";
import Layout from "../components/layout";
import Image from "../components/image"
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import Link from "next/link";
import { FaGithubAlt,FaLinkedin,FaFileWord } from 'react-icons/fa';


const About = ({ about, categories}) => {
  return (
    <Layout categories={categories}>
      <div
        id="container"
        className="max-w-5xl text-center justify-center 
        items-center mx-auto mt-10 text-lg
        grid sm:grid-cols-2 grid-cols-1 gap-x-4 p-5"
      >
        <Image
          image={about.attributes.image}
          className="inline-block mx-auto mb-10 sm:m-0 rounded-3xl"
          alt="a picture of me"
        />

        <div className="inline-block [&>*>a]:text-orange-400 dark:[&>*>a]:text-cyan-400">
          <h1 className="text-2xl sm:text-4xl mb-5">
            {about.attributes.header}
          </h1>
          <ReactMarkdown
            className="leading-relaxed 
          "
            rehypePlugins={[rehypeRaw]}
          >
            {about.attributes.body}
          </ReactMarkdown>

          <div id="currentPosition" className="mt-3">
            <span className="text-slate-600 dark:text-slate-400">Current position: </span>{about.attributes.currentPosition.positionTitle} with{" "}
            <Link href={about.attributes.currentPosition.companyLink}>
              {about.attributes.currentPosition.companyTitle}.
            </Link>
          </div>

          <div id="currentProject" className="mt-3">
            <span className="text-slate-600 dark:text-slate-400">Current project: </span>
            {about.attributes.currentlyWorkingOn}
          </div>

          <ul className="list-none mt-5 [&>*]:inline-block space-x-5">
            <li>
              <Link href={about.attributes.github}>
                <FaGithubAlt size="30" />
              </Link>
            </li>
            <li>
              <Link href={about.attributes.linkedIn}>
                <FaLinkedin size="30" />
              </Link>
            </li>
            <li>
              <Link href={about.attributes.resumeUrl}>
                <FaFileWord size="30" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div id="skills" className="max-w-5xl m-auto text-center p-4">
        <h1 className="text-5xl bg-black text-white 
        dark:bg-white dark:text-black p-5 mt-5
        rounded-t-3xl">Skills</h1>
        <ul id="skillsList" className="list-none outline outline-1 mx-[1px] mb-0">
          {Object.entries(about.attributes.skills).map((skill) => {
            console.log(skill);
            return (
              <li className="mb-4" key={skill[0]}>
                <h1 className="text-3xl inline-block mt-5 mb-3 font-bold">{skill[0]}</h1>
                <p className="text-xl mb-5">{skill[1]}</p>
                <hr />
              </li>
              
            );
          })}
        </ul>
        <div className="h-12 bg-black dark:bg-white block mt-[-15px] rounded-b-xl">

        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [aboutRes, categoriesRes] = await Promise.all([
    fetchAPI("/about", { populate: {
      image: "*",
      currentPosition: "*",
      skills: "*",
      currentlyWorkingOn: "*"
    } }),
    fetchAPI("/categories", {}),
  ]);

  return {
    props: {
      about: aboutRes.data,
      categories: categoriesRes.data,
    },
    revalidate: 1,
  };
}

export default About;