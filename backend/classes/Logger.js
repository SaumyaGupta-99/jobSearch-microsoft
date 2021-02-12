import winston from "winston";
import chalk from "chalk";
import { LoggerCallback } from "erel";

/**
 * Adapter for logger
 */
class Logger {
  constructor() {
    const errorStackFormat = winston.format((err) => {
      if (err.level == "error") {
        return Object.assign({}, err, {
          stack: err.stack,
          message: err.message,
        });
      }
      return err;
    });

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            errorStackFormat(),
            winston.format.colorize(),
            winston.format.json(),
            winston.format.printf(
              (info) => `${info.timestamp} ${info.level}: ${info.message}`
            ),
            winston.format.simple()
          ),
          level: "info", // Local Dev to preview all logging events
          handleExceptions: true, // Show exceptions in the console
        }),
      ],
    });
  }

  trace(...args) {
    this.logger.trace(...args);
  }
  debug(...args) {
    this.logger.debug(...args);
  }
  info(...args) {
    this.logger.info(...args);
  }
  warn(...args) {
    this.logger.warn(...args);
  }
  error(...args) {
    this.logger.error(...args);
  }

  expressMiddleware(req, res, next) {
    var ip =
      (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    console.log(
      new Date().toLocaleString() +
        chalk.green(` [${ip}] ${req.method} - ${req.url} `)
    );
    next();
  }
  exitMiddleware(data, req, res) {
    console.log(
      `${chalk.bgBlue("log")}: ${data.rawExitDate.toLocaleString()} - ${
        data.ip
      } - ${data.method} - ${data.route} - ${data.statusCode} - ${
        data.responseTime
      }`
    );
  }
}

export default new Logger();
