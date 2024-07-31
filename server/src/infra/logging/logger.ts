import { createLogger, format, transports, Logger, level } from "winston";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../../config";

const { combine, timestamp, printf } = format;

interface LoggerWithFilename extends Logger {
  filename?: string;
}

const moduleFormat = printf(({ level, message, timestamp, stack, filename }) => {
  return `${timestamp} [${filename}] ${level}: ${message} ${stack || ""}`;
});

console.log("Logging level: ", config.server.logging.level);

const analysisLogger = createLogger({
  level: config.server.logging.analysis_level,
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
    new DailyRotateFile({
      filename: "error-%DATE%.log",
      dirname: "logs",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "7d"
    }),
    new DailyRotateFile({
      filename: "combined-%DATE%.log",
      dirname: "logs",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "7d"
    })
  ]
}) as LoggerWithFilename;

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
    new DailyRotateFile({
      filename: "error-%DATE%.log",
      dirname: "logs",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "7d"
    }),
    new DailyRotateFile({
      filename: "combined-%DATE%.log",
      dirname: "logs",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "7d"
    })
  ]
}) as LoggerWithFilename;

export default function getLogger(modulePath: string, logType?: LogTypes): Logger {
  const filename = path.basename(modulePath);
  if (logType === LogTypes.Analysis) {
    return analysisLogger.child({ filename });
  }
  return logger.child({ filename });
}

export enum LogTypes {
  Analysis,
  Standard
}
