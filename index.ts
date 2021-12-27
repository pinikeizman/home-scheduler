import config, { appName } from "./src/config";
import { createJob } from "./src/10bis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import scheduler from "./src/schedular";
import logger from "./src/logger";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

logger.info(`Starting ${appName} application`, { env: config });

logger.info("Adding 10bis job to run every day at 12pm");
scheduler.add(createJob(), "0 12 * * *");
