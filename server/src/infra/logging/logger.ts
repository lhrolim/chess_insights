// logger.ts
import { createLogger, format, transports, Logger } from "winston";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import config from "../../config";

const { combine, timestamp, printf } = format;

interface LoggerWithFilename extends Logger {
  filename?: string;
}

const moduleFormat = printf(({ level, message, timestamp, stack, filename }) => {
  return `${timestamp} [${filename}] ${level}: ${message} ${stack || ""}`;
});

const logger = createLogger({
  level: config.server.logging.level,
  format: combine(
    format(info => {
      if (info.stack) {
        info.message = `${info.message} ${info.stack}`;
      }
      return info;
    })(),
    timestamp(),
    moduleFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" })
  ]
}) as LoggerWithFilename;

export default function getLogger(modulePath: string): Logger {
  const filename = path.basename(modulePath);
  return logger.child({ filename });
}
