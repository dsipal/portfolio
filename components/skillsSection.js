import NextImage from "./image";

const SkillsSection = ({skills}) => {
    return(
        <div id="skills" className="max-w-3xl m-auto p-5">
        <h1 className="text-5xl text-black dark:text-white p-5 mt-5
        rounded-t-3xl text-center">My skills include:</h1>
        <ul id="skillsList" className="list-none mx-[1px] mb-0">
          {skills.map((skill) => {
            return (
              <li className="mb-4 p-2" key={skill.id}>
                <NextImage className="h-24 fill-white" image={skill.icon} />
                <h1 className="text-3xl inline-block ml-5 mt-5 mb-3 
                font-bold underline text-left">{skill.name}:</h1>
                <p className="text-xl mb-5 text-center">{skill.description}</p>
              </li>
            );
          })}
        </ul>
        <div className="h-12 bg-black dark:bg-white block mt-[-15px] rounded-b-xl">
        </div>
      </div>
    )
}

export default SkillsSection