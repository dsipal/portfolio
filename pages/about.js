import React from "react"
import Layout from "../components/layout"
import { fetchAPI } from "../lib/api"
import AboutSection from "../components/aboutSection"
import SkillsSection from "../components/skillsSection"
import TechSection from "../components/techSection"
import Seo from "../components/seo"

const About = ({ about, categories }) => {
  //TODO: set this up to get pageTitle from strapi somehow.
  const seo = {
    pageTitle: "about",
  }
  return (
    <Layout categories={categories}>
      <Seo seo={seo} />
      <AboutSection about={about} />
      {/* <SkillsSection skills={about.attributes.skills} /> */}
      {/* <TechSection tech={about.attributes.tech} /> */}
    </Layout>
  )
}

export async function getStaticProps() {
  // Run API calls in parallel
  const [aboutRes, categoriesRes] = await Promise.all([
    fetchAPI("/about", {
      populate: {
        image: "*",
        currentPosition: "*",
        currentlyWorkingOn: "*",
      },
    }),
    fetchAPI("/categories", {}),
  ])

  return {
    props: {
      about: aboutRes.data,
      categories: categoriesRes.data,
    },
    revalidate: 1,
  }
}

export default About
