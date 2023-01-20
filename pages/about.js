import React from "react";
import Layout from "../components/layout";
import { fetchAPI } from "../lib/api";
import AboutSection from "../components/aboutSection";
import SkillsSection from "../components/skillsSection";
import TechSection from "../components/techSection"

const About = ({ about, categories }) => {
  console.log(about.attributes.tech)
  return (
    <Layout categories={categories}>
      <AboutSection about={about} />
      {/* <SkillsSection skills={about.attributes.skills} /> */}
      {/* <TechSection tech={about.attributes.tech} /> */}
    </Layout>
  );
};

export async function getStaticProps() {
  // Run API calls in parallel
  const [aboutRes, categoriesRes] = await Promise.all([
    fetchAPI("/about", { populate: {
      image: "*",
      currentPosition: "*",
      skills: {
        populate: "*"
      },
      tech: {
        populate: "*"
      },
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