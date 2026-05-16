import React, {useCallback,useState,useEffect,useMemo} from 'react'
import { Grid, GridItem } from '@strapi/design-system/Grid'
import { Box } from '@strapi/design-system/Box'
import { Searchbar, SearchForm, Button } from '@strapi/design-system'
import { Typography } from '@strapi/design-system/Typography'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useIntl } from 'react-intl';

//init icon packs
const sources = [fas,fab,far]
const label_dict = {
  "fas": "fa-solid",
  "fab": "fa-brands",
  "far": "fa-regular"
}
sources.forEach(source => {
  library.add(source)
})

//generates the string that is stored 
const getIconString = (icon) => {
  return String(`${label_dict[icon.prefix]} ${icon.iconName}`)
}

//formats source into an array with required values
const arrayFromSource = (source) => {
  return Object.values(source).map((icon) => {
    return {
      "icon": icon, 
      "string":getIconString(icon),
      "prefix": icon.prefix,
      "name": icon.iconName
    }
  })
}

//makes an array out of all icon sources
const makeList = (sources) => {
  let x = []
  sources.forEach(source => {
    const y = arrayFromSource(source)
    x = x.concat(y)
  })
  return x
}

//element to display current icon & handle errors
const CurrentIcon = (value) => {
  if (typeof value.value === "string" && value.value.split(" ").length === 2) {
    const [prefix, iconName] = value.value.split(" ");
    const icon = { prefix, iconName };
    return (<FontAwesomeIcon icon={icon} size="2x" inverse></FontAwesomeIcon>)
  } else {
    return <Typography>None</Typography>
  }
}

const Field = ({
    name,
    onChange,
    required,
    value
}) => {
  const iconList = useMemo(() => makeList(sources),[])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(36)
  const [iconsToDisplay, setIconsToDisplay] = useState([])
  const { formatMessage } = useIntl()
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const iconsArray = Object.entries(iconList)
    .filter(([key,icon]) => {
      if (icon.string.includes(value)) {
        return true
      }
    }).sort()

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const iconsToDisplay = iconsArray.slice(startIndex, endIndex)
    setIconsToDisplay(iconsToDisplay)
    const totalPages = Math.ceil(iconsArray.length / itemsPerPage)
    setTotalPages(totalPages)
  }, [currentPage, itemsPerPage, iconList, value])
  
  const handleChange = useCallback((e, newValue) => {
    onChange({target: { name, value: e.target.value || newValue, type: "string"}})
  }, [onChange, name])

  const makeElem = ([key,icon]) => {
    return (
      <GridItem
      padding={2}
      col={2}
      key={key}>
        <Box onClick={(e) => handleChange(e, icon.string)}>
              <FontAwesomeIcon icon={icon.icon} inverse/>
            </Box>
      </GridItem>
    )
  }

  return (
    <>
      <Box paddingBottom={8}>
        <SearchForm>
          <Box>
            <Typography>Current Icon: </Typography>
            <CurrentIcon value={value} />
          </Box>
          <Searchbar
          name="icon-search"
          value={value}
          clearLabel={formatMessage({ id: 'clearLabel', defaultMessage: 'Clear'})}
          onChange = {e => handleChange(e)}
          onClear={e => handleChange(e, '')}
          placeholder="Search"
          required={required}
          >
            Search
          </Searchbar>
        </SearchForm>
      </Box>

      <Box height="200px" overflow="hidden" background={'neutral0'}>
        <Grid>
          {iconsToDisplay.map(makeElem)}
        </Grid>
      </Box>
      <Box>
        <Grid>
          <GridItem><Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button></GridItem>
          <GridItem><Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || iconsToDisplay.length === 0}>Next</Button></GridItem>
        </Grid>
      </Box>
    </>
  )
}

export default Field