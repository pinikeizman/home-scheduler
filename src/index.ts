import config, { appName } from "./config";
import { createJob as createHeartbeatJob } from "./heartbeat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import scheduler from "./scheduler";
import logger from "./logger";
import {
  createMDSection,
  createPlainTextSection,
  createSlackBolt,
  sendSlackMessage,
} from "./slack";
import os from "os";
import { use10BisShortcut } from "./10bis/views";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

sendSlackMessage(`⥁ Starting ${appName} schduler`, [
  createPlainTextSection(`Starting ${appName} schduler`),
  createMDSection({ os: process.platform, hostname: os.hostname() }),
]);

logger.info(`Starting ${appName} schduler application`, { env: config });

const app = createSlackBolt()
  .then(use10BisShortcut)
  .then(async (app) => {
    await app.start();
    logger.info(`㋡ Starting ${appName} Bolt application`);
    sendSlackMessage(`㋡ Starting ${appName} Bolt application`, [
      createPlainTextSection(`Starting ${appName} Bolt application`),
    ]);

    scheduler.add(createHeartbeatJob(app, "U02S3G28H9Q"));
    return app;
  });

process.on("SIGTERM", function () {
  logger.info("Terminating application");
  app.then((a) => a.stop()).finally(() => process.exit(0));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception thrown to not ignore this", err);
  sendSlackMessage("Uncaught Exception", [createMDSection({ err })]);
  process.exit(1);
});
