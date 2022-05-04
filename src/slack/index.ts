import config, { appName } from "../config";
import axios from "axios";
import { App } from "@slack/bolt";
import os from "os";
import logger from "../logger";

const slackWebhook = config.SLACK_WEBHOOK || "";

export const sendSlackMessage: (
  msg: string,
  blocks?: object[]
) => Promise<object> = async (msg, blocks) =>
  axios
    .post(
      slackWebhook,
      { ...(msg ? { text: msg } : {}), blocks },
      {
        headers: { "Content-type": "application/json" },
      }
    )
    .then((res) => res.data);

export const createMDSection: (data: any) => {
  type: "section";
  text: { type: "mrkdwn"; text: string };
} = (data) => ({
  type: "section",
  text: {
    type: "mrkdwn",
    text: `\`\`\`${JSON.stringify(data, null, 2).substring(0, 2900)}\`\`\``,
  },
});

export const createPlainTextSection: (data: string) => {
  type: "section";
  text: { type: "plain_text"; text: string };
} = (data) => ({
  type: "section",
  text: {
    type: "plain_text",
    text: data,
    emoji: true,
  },
});

export const createSlackBolt = async () => {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN, // add this
  });

  app.message("homie", async ({ message, say, body }) => {
    // say() sends a message to the channel where the event was triggered
    logger.info(`Message recived`, message);
    // @ts-ignore
    await say(`Hey there <@${message.user}>!`);
  });
  return app;
};
