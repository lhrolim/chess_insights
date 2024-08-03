// unhandledRejectionHandler.js
import getLogger from "@infra/logging/logger";
const logger = getLogger("unhandledRejectionHandler");

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  throw reason;
  // Optionally, you can exit the process with a non-zero status code
  // process.exit(1);
});
