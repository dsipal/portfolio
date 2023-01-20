const SkillsSection = ({skills}) => {
    return(
        <div id="skills" className="max-w-5xl m-auto p-4">
        <h1 className="text-5xl bg-black text-white 
        dark:bg-white dark:text-black p-5 mt-5
        rounded-t-3xl text-center">What I can do for you</h1>
        <ul id="skillsList" className="list-none outline outline-1 mx-[1px] mb-0">
          {Object.entries(skills).map((skill) => {
            return (
              <li className="mb-4" key={skill[0]}>
                <h1 className="text-3xl inline-block ml-5 mt-5 mb-3 
                font-bold underline text-left">{skill[0]}:</h1>
                <p className="text-xl mb-5 text-center">{skill[1]}</p>
                <hr />
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