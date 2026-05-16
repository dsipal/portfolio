const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  var { host, port, database, user, password } = parse(env("DATABASE_URL"));

  if(port==null){
    port = 5432
  }
  
  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
      },
      debug: false,
    },
  };
};