import pluginPkg from '../../package.json'
import pluginId from './pluginId'
import Initializer from "./components/Initializer"

const name = pluginPkg.strapi.name

const options = {
  id: pluginId,
  initializer: Initializer,
  isReady: false,
  name,
}

export default {
  register(app) {
    app.registerPlugin(options)
    app.customFields.register({
      name:"icon",
      description:"icon custom field",
      type:'string',
      pluginId: "fontawesome-strapi",
      components: {
        Input: async () => import("./components/IconField")
      },
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      intlDescription: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
    })
  }
}