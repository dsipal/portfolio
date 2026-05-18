module.exports = [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      origin: ["http://localhost:3000", "http://portfolio:3000"],
      methods: ["GET", "OPTIONS"],
      headers: ["Content-Type", "Authorization"],
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::favicon",
  "strapi::public",
];
