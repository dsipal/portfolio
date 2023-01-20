import React from "react";
import Layout from "../components/layout";
import Image from "../components/image"
import Seo from "../components/seo";
import { fetchAPI } from "../lib/api";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import Link from "next/link";
import { FaGithubAlt,FaLinkedin,FaFileWord } from 'react-icons/fa';
import AboutSection from "../components/aboutSection";
import SkillsSection from "../components/skillsSection";



const About = ({ about, categories }) => {
  return (
    <Layout categories={categories}>
      <AboutSection about={about} />
      <SkillsSection skills={about.attributes.skills} />
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