export default {
  client: {
    relative_build_directory: "../client/build",
    routes: ["/", "/about", "/spotify-authorization"],
    subdirectory: process.env.CLIENT_DEPLOYMENT_SUBDIRECTORY || ""
  },
  server: {
    allowed_origins: (process.env.SERVER_ALLOWED_ORIGINS && process.env.SERVER_ALLOWED_ORIGINS.split(",")) || "",
    session_keys: (process.env.SERVER_SESSION_KEYS && process.env.SERVER_SESSION_KEYS.split(" ")) || [],
    database: {
      server: process.env.MONGO_DB_SERVER,
      port: process.env.MONGO_DB_PORT,
      database: process.env.MONGO_DB_NAME,
      mongo_user: process.env.MONGO_DB_USER,
      mongo_password: process.env.MONGO_DB_PASSWORD
    },
    stockfish: {
      port: process.env.STOCKFISH_PORT,
      host: process.env.STOCKFISH_HOST
    },
    logging: {
      level: process.env.LOG_LEVEL || "debug",
      analysis_level: process.env.ANALYSIS_LOG_LEVEL || "info"
    },
    aws: {
      accountID: process.env.AWS_ACCOUNT_ID,
      accesskey: process.env.AWS_ACCESS_KEY,
      secretkey: process.env.AWS_SECRET_KEY,
      region: process.env.SQS_REGION,
      sqs: {
        url: process.env.SQS_URL,
        port: process.env.SQS_PORT,
        topic_names: {
          pgn: process.env.SQS_PGN_TOPIC_NAME
        }
      }
    },
    env: process.env.NODE_ENV || "dev",
    isLocal: () => {
      return !process.env.NODE_ENV || process.env.NODE_ENV === "dev";
    }
  }
};
