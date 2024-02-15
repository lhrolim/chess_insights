export default {
  client: {
    relative_build_directory: "../client/build",
    routes: ["/", "/about", "/spotify-authorization"],
    subdirectory: process.env.CLIENT_DEPLOYMENT_SUBDIRECTORY || ""
  },
  server: {
    allowed_origins: process.env.SERVER_ALLOWED_ORIGINS.split(","),
    session_keys: process.env.SERVER_SESSION_KEYS.split(" "),
    database: {
      mongo_uri: process.env.MONGO_DB_CONNECTION_STRING
    },
    stockfish:{
      port: process.env.STOCKFISH_PORT,
      host: process.env.STOCKFISH_HOST
    }
  }
};
