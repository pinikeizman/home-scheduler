export type Config = {
  APP_NAME?: string;
  TENBIS_USER_TOKEN?: string;
  SLACK_WEBHOOK?: string;
};

const config: Config = {
  ...require("dotenv").config().parsed,
  ...process.env,
};

export const appName = config.APP_NAME || "home-scheduler";

export default config;
