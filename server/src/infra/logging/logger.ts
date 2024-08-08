import { createLogger, format, transports, Logger } from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";
import { getConfig } from "../../config";
const config = getConfig();

const { combine, timestamp, printf } = format;

interface LoggerWithFilename extends Logger {
  filename?: string;
  traceEnabled: boolean;
  trace: (message: string) => void;
}

const moduleFormat = printf(({ level, message, timestamp, stack, filename }) => {
  return `${timestamp} [${filename}] ${level}: ${message} ${stack || ""}`;
});

console.log("Logging level: ", config.server.logging.level);

const createCustomLogger = (level: string): LoggerWithFilename => {
  const traceEnabled = level === "trace";
  if (level === "trace") {
    level = "debug";
  }
  const logger = createLogger({
    level,
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
  logger.traceEnabled = traceEnabled;

  logger.trace = (message: string) => {
    if (logger.traceEnabled) {
      logger.debug(message);
    }
  };

  return logger;
};

const analysisLogger = createCustomLogger(config.server.logging.analysis_level);
const logger = createCustomLogger(config.server.logging.level);

export default function getLogger(modulePath: string, logType?: LogTypes): LoggerWithFilename {
  const filename = path.basename(modulePath);
  if (logType === LogTypes.Analysis) {
    return analysisLogger.child({ filename }) as LoggerWithFilename;
  }
  return logger.child({ filename }) as LoggerWithFilename;
}

export enum LogTypes {
  Analysis,
  Standard
}
