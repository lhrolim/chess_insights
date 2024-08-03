require("module-alias/register");
import dotenv from "dotenv";
dotenv.config(); // Setup .env

import express from "express";
import https from "https";
import fs from "fs";
import cookieSession from "cookie-session";
import path from "path";
import Config from "./config";
import singleGameRoutes, { subRoute as gameSubRoute } from "@api/routes/singleGameRoutes";
import batchGameRoutes, { subRoute as batchGameSubRoute } from "@api/routes/batchGamesRoutes";
import { connectToDatabase } from "@internal/database/MongoConnection";

import { errorMiddleware } from "@infra/middlewares/errorMiddleware";
import getLogger from "@infra/logging/logger";

// import "@infra/middlewares/unhandledRejectionsHandler"; // Import the unhandledRejectionsHandler to catch unhandled promise rejections

const app = express();
const isProduction = app.get("env") === "production";

app.set("trust proxy", 1); // Trust first proxy
app.use(express.json());

const logger = getLogger(__filename);

// Session
app.use(
  cookieSession({
    keys: Config.server.session_keys,
    maxAge: 48 * 60 * 60 * 1000, // Expires in 48 hours
    sameSite: "none",
    secure: isProduction // Adjusted to conditionally require SSL
  })
);

// CORS
app.use((req, res, next) => {
  const origin = req.get("origin") || req.get("referrer");
  if (!isProduction) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (Config.server.allowed_origins.indexOf(origin) !== -1) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Here, you could log the error and continue the application instead of crashing it
});

// Catch uncaught exceptions
process.on("uncaughtException", error => {
  console.error("Uncaught Exception:", error);
  // Note: It's risky to continue running the application after an uncaught exception
  // as it may be in an undefined state. Consider logging the error and restarting the application gracefully.
});

// Static files from the React app
const clientBuildDirectory = path.join(__dirname, Config.client.relative_build_directory);
app.use(express.static(clientBuildDirectory)); // Non-index.html files
Config.client.routes.forEach(route => app.use(route, express.static(path.join(clientBuildDirectory, "index.html"))));

// API Endpoints
app.use(gameSubRoute, singleGameRoutes);
app.use(batchGameSubRoute, batchGameRoutes);

app.use(errorMiddleware);

// Function to initialize application
async function initializeApplication() {
  await connectToDatabase(); // Connect to database asynchronously

  // Static files, CORS, API endpoints setup...

  const port = process.env.PORT || 5000;

  if (!isProduction) {
    https
      .createServer(
        {
          cert: fs.readFileSync("server.cert"),
          key: fs.readFileSync("server.key")
        },
        app
      )
      .listen(port, () => {
        console.log(`Listening on ${port} with HTTPS`);
      });
  } else {
    app.listen(port, () => {
      console.log(`Listening on ${port}`);
    });
  }
  logger.debug(`Debug active...`);
  logger.info(`Server started on port ${port}`);
}

// Immediately invoke the async function to start the application
initializeApplication().catch(error => {
  console.error('Failed to initialize the application', error);
  process.exit(1); // Exit with failure in case of an error
});
