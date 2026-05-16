'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: "icon",
    plugin: "fontawesome-strapi",
    type: "string",
    components: {
      IconField: async () => import(/* webpackChunkName: "input-component" */ "../admin/src/components/IconField")
    }
  });
};
