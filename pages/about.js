import React from "react";
import Layout from "../components/layout";
import Image from "../components/image"
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";


const About = ({ about, categories}) => {
    console.log(about)
    console.log(about.attributes.Image)
    return (
    <Layout categories={categories}>
        <div id="me" className="max-w-7xl">
            <Image image={about.attributes.Image} className="m-auto" alt="a picture of me"></Image>
        </div>
    </Layout>
    );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [aboutRes, categoriesRes] = await Promise.all([
    fetchAPI("/about", { populate: "*" }),
    fetchAPI("/categories", { populate: "Image" }),
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