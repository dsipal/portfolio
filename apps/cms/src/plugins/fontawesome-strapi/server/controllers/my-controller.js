'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('fontawesome-strapi')
      .service('myService')
      .getWelcomeMessage();
  },
});
