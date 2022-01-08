import config, { appName } from "./config";
import { createJob as create10BisJob } from "./10bis";
import { createJob as createHeartbeatJob } from "./heartbeat";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import scheduler from "./scheduler";
import logger from "./logger";
import { createMDSection, sendSlackMessage } from "./slack";
import os from "os";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// sendSlackMessage(`Starting ${appName} application`, [
//   createMDSection({ os: process.platform, hostname: os.hostname() }),
// ]);
// logger.info(`Starting ${appName} application`, { env: config });
scheduler.add(create10BisJob());
scheduler.add(createHeartbeatJob());
