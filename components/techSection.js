import Link from "next/link"
import NextImage from "./image";
import { FaNodeJs,FaReact,FaDatabase,FaSass } from 'react-icons/fa';
import { SiAdobephotoshop, SiAdobeillustrator, SiAdobeaftereffects } from 'react-icons/si'
import dynamic from 'next/dynamic'

const TechSection = ({tech}) => {

    const CustomIcon = dynamic(() => getIcon(tech[0].icon), {
        loading: () => 'Loading...',
      })
    //const CustomIcon = dynamic((tech[0].icon) => getIcon(tech[0].icon))
    return (
        <ul className="space-x-5 list-none [&>*]:inline-block">
            <CustomIcon></CustomIcon>
            
            {/* {tech.map((t) => {
                const CustomIcon = getIcon(t.icon)
            return (
              <li key={t.id}>
                <Link href={t.link}>
                    <CustomIcon />
                </Link>
              </li>
            );
          })} */}
        </ul>
        
    )
}
//const CustomTag = `h${this.props.level}`;
const getIcon = (iconName) => {
    switch(iconName) {
        case 'FaNodeJs':
            return(`<FaNodeJs></FaNodeJs>`)
        case 'FaReact':
            return(<FaReact />)
        case 'FaDatabase':
            return(<FaDatabase />)
        case 'FaSass':
            return(<FaSass />)
        case 'SiAdobephotoshop':
            return(<SiAdobephotoshop />)
        case 'SiAdobeillustrator':
            return(<SiAdobeillustrator />)
        case 'SiAdobeaftereffects':
            return(<SiAdobeaftereffects> </SiAdobeaftereffects>)
        
    }
}

export default TechSection