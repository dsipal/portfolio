const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  const databaseUrl = env("DATABASE_URL", "");
  const parsed = databaseUrl ? parse(databaseUrl) : {};
  const { host, database, user, password } = parsed;
  const port = parsed.port ?? 5432;

  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: false,
      },
      debug: false,
    },
  };
};