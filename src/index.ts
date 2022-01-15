import config, { appName } from "./config";
import { createJob as create10BisJob } from "./10bis";
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
import { myfunc } from "./10bis/order-sufersal.playwrite";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

sendSlackMessage(`⥁ Starting ${appName} schduler`, [
  createPlainTextSection(`Starting ${appName} schduler`),
  createMDSection({ os: process.platform, hostname: os.hostname() }),
]);

logger.info(`Starting ${appName} schduler application`, { env: config });
scheduler.add(create10BisJob());
scheduler.add(createHeartbeatJob());

const app = createSlackBolt()
  .then(use10BisShortcut)
  .then(async (app) => {
    await app.start();
    logger.info(`㋡ Starting ${appName} Bolt application`);
    sendSlackMessage(`㋡ Starting ${appName} Bolt application`, [
      createPlainTextSection(`Starting ${appName} Bolt application`),
    ]);
    
    return app;
  });
