export type Config = {
  APP_NAME?: string;
  TENBIS_USER_TOKEN?: string;
  SLACK_WEBHOOK?: string;
  SLACK_SIGNING_SECRET?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;
  SLACK_NOTIFICATION_CHANNEL?: string;
  DB_FILE_PATH: string;
};

const config: Config = {
  ...require("dotenv").config().parsed,
  ...process.env,
};

export const appName = config.APP_NAME || "home-scheduler";

export default config;
