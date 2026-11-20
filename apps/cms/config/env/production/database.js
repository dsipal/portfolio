module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("POSTGRES_HOST", "localhost"),
      port: env.int("POSTGRES_PORT", 5432),
      database: env("POSTGRES_DB"),
      user: env("POSTGRES_USER"),
      password: env("POSTGRES_PASSWORD"),
      ssl: false,
    },
    debug: false,
  },
});
