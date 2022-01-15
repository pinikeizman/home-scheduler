import { App, BlockAction, SlackShortcut } from "@slack/bolt";
import { ViewsOpenArguments, ViewsUpdateArguments } from "@slack/web-api";
import { use10BisBeforeExpiration } from ".";
import logger from "../logger";
import { myfunc } from "./order-sufersal.playwrite";
// import { run10BisCypress } from "./order-sufersal-runner";

export const createOrder10bisView: (
  shortcut: SlackShortcut
) => ViewsOpenArguments = (shortcut: SlackShortcut) => ({
  trigger_id: shortcut.trigger_id,
  view: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "10bis SuferSal Voucher",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "How much would you like to spent?",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "100₪",
          },
          style: "primary",
          value: "click_me_123",
          action_id: "action.10bis.buy.sufersal",
        },
      },
    ],
  },
});

export const successView: (
  view_id: string,
  hash: string
) => ViewsUpdateArguments = (view_id, hash) => ({
  view_id,
  hash,
  view: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "10 Bis Utilization",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "**Success**",
        },
      },
    ],
  },
});

export const loadingView: (
  view_id: string,
  hash: string
) => ViewsUpdateArguments = (view_id, hash) => ({
  view_id,
  hash,
  view: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "10 Bis Utilization",
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Loading",
        },
      },
    ],
  },
});

export const use10BisShortcut: (app: App) => App = (app: App) => {
  logger.info("Listening on 10 bis shortcuts");
  app.shortcut(
    "action.10bis.offer",
    async ({ shortcut, ack, client, logger }) => {
      try {
        await ack();
        const result = await client.views.open(createOrder10bisView(shortcut));
        logger.info("res", { result });
      } catch (error) {
        logger.error(error);
      }
    }
  );

  app.shortcut(
    "action.10bis.report",
    async ({ shortcut, ack, body, logger, client }) => {
      try {
        await ack();
        await use10BisBeforeExpiration({
          notify: (props) =>
            client.chat.postMessage({ channel: body.user.id, ...props }),
        });
      } catch (error) {
        logger.error(error);
      }
    }
  );

  app.action<BlockAction>(
    "action.10bis.buy.sufersal",
    async ({ ack, client, logger, body, payload, action }) => {
      try {
        await ack();
        const a = await client.views.update(
          loadingView(body?.view?.id || "", body?.view?.hash || "")
        );
        await myfunc(app, body.user.id);
        const result = await client.views.update(
          successView(a.view?.id || "", a?.view?.hash || "")
        );
        logger.info("res", { result });
      } catch (error) {
        logger.error(error);
      }
    }
  );

  return app;
};
