import React from "react";
import Layout from "../components/layout";
import Image from "../components/image"
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import Link from "next/link";
import { FaGithubAlt,FaLinkedin } from 'react-icons/fa';


const About = ({ about, categories}) => {
    return (
      <Layout categories={categories}>
        <div
          id="container"
          className="max-w-7xl text-center justify-center items-center mx-auto mt-10 text-lg"
        >
          <Image
            image={about.attributes.image}
            className="mx-auto mt-20"
            alt="a picture of me"
          />

          <ReactMarkdown className="mt-10" rehypePlugins={[rehypeRaw]}>
            {about.attributes.body}
          </ReactMarkdown>

          <ul className="list-none mt-5 [&>*]:inline-block space-x-5">
            <li>
              <Link href={about.attributes.github} className="mr-6">
                <FaGithubAlt className="mx-auto" size="30" />
              </Link>
            </li>
            <li>
              <Link href={about.attributes.linkedIn} className="mr-6">
                <FaLinkedin className="mx-auto" size="30" />
              </Link>
            </li>
          </ul>
        </div>
      </Layout>
    );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [aboutRes, categoriesRes] = await Promise.all([
    fetchAPI("/about", { populate: "image" }),
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