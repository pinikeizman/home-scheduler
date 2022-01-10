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
  sendSlackMessage,
} from "./slack";
import os from "os";
import { App } from "@slack/bolt";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

sendSlackMessage(`⥁ Starting ${appName} schduler`, [
  createPlainTextSection(`Starting ${appName} schduler`),
  createMDSection({ os: process.platform, hostname: os.hostname() }),
]);

logger.info(`Starting ${appName} schduler application`, { env: config });
scheduler.add(create10BisJob());
scheduler.add(createHeartbeatJob());

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN, // add this
});

app.message("homie", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  logger.info(`Message recived`, message);
  // @ts-ignore
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  // Start your app
  await app.start();
  logger.info(`㋡ Starting ${appName} Bolt application`);

  sendSlackMessage(`㋡ Starting ${appName} Bolt application`, [
    createPlainTextSection(`Starting ${appName} Bolt application`),
    createMDSection({ os: process.platform, hostname: os.hostname() }),
  ]);
})();
