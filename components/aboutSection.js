import Image from "../components/image"
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import Link from "next/link";
import { FaGithubAlt,FaLinkedin,FaFileWord } from 'react-icons/fa';


const AboutSection = ({about}) => {
    return(
        <div
        id="container"
        className="max-w-5xl text-center justify-center 
        items-center mx-auto mt-5 text-lg
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
    )
}

export default AboutSection