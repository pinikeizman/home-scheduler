import { appName } from "./config";

const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: appName },
});
logger.add(
  new winston.transports.Console({
    format: winston.format.json(),
  })
);

export default logger
