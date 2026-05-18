module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('USERS_PERMISSIONS_JWT_SECRET'),
    },
  },
  'fontawesome-strapi': {
    enabled: true,
    resolve: './src/plugins/fontawesome-strapi',
  },
})