import config from "../config";
import axios from "axios";

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
