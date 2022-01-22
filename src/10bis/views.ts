import { App, BlockAction, SlackShortcut } from "@slack/bolt";
import { ViewsOpenArguments, ViewsUpdateArguments, View } from "@slack/web-api";
import { addUser, getDataFromDisk } from "../database";
import { getUserTransaction, use10BisBeforeExpiration } from ".";
import logger from "../logger";
import { but10bisSufersalVoucher } from "./order-sufersal.playwrite";

export const create10bisSigninView: (
  shortcut: SlackShortcut
) => ViewsOpenArguments = (shortcut: SlackShortcut) => ({
  trigger_id: shortcut.trigger_id,
  view: {
    callback_id: "10bis_signin_view",
    type: "modal",
    title: {
      type: "plain_text",
      text: "10bis App Signup",
    },
    submit: {
      type: "plain_text",
      text: "Submit",
    },
    blocks: [
      {
        type: "input",
        block_id: "user_10bis_token",
        element: {
          type: "plain_text_input",
          action_id: "user_10bis_token_txt_input",
        },
        label: {
          type: "plain_text",
          text: "10bis User Token",
          emoji: true,
        },
      },
    ],
  },
});

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

export const successView: View = {
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
        text: "*Success* :tada:",
      },
    },
  ],
};

export const updateSuccessView: (
  view_id: string,
  hash: string
) => ViewsUpdateArguments = (view_id, hash) => ({
  view_id,
  hash,
  view: successView,
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
    "action.10bis.signin",
    async ({ shortcut, ack, client, logger }) => {
      try {
        await ack();
        const result = await client.views.open(create10bisSigninView(shortcut));
        logger.info("res", { result });
      } catch (error) {
        logger.error(error);
      }
    }
  );

  app.view("10bis_signin_view", async ({ body, view, client, ack }) => {
    await ack();
    await addUser({
      id: body.user.id,
      name: body.user.name,
      tenbisToken:
        view.state.values["user_10bis_token"]["user_10bis_token_txt_input"]
          .value || "",
    })
      .then(() =>
        client.chat.postMessage({
          channel: body.user.id,
          text: "10bis Signup successfully",
        })
      )
      .catch(logger.error);
  });

  app.shortcut(
    "action.10bis.offer",
    async ({ shortcut, ack, client, body }) => {
      try {
        await ack();
        const result = await client.views.open(createOrder10bisView(shortcut));
        logger.info("res", { result });
      } catch (error) {
        logger.error(error);
      }
    }
  );

  app.shortcut("action.10bis.report", async ({ ack, body, client }) => {
    try {
      await ack();
      const user = await getDataFromDisk().then((s) => s.users[body.user.id]);
      logger.info("Reporting user", { user });
      await use10BisBeforeExpiration(
        {
          notify: (props) =>
            client.chat.postMessage({ channel: body.user.id, ...props }),
        },
        user.tenbisToken || ""
      );
    } catch (error) {
      logger.error(error);
      client.chat.postMessage({
        channel: body.user.id,
        text: `We weren't able to create a report for you, check your :cry:`,
      });
    }
  });

  app.action<BlockAction>(
    "action.10bis.buy.sufersal",
    async ({ ack, client, body }) => {
      try {
        await ack();
        const user = await getDataFromDisk().then((s) => s.users[body.user.id]);
        logger.info("Buying 10bis voucher", { user });
        const { view: updateView } = await client.views.update(
          loadingView(body?.view?.id || "", body?.view?.hash || "")
        );
        await getUserTransaction(user.tenbisToken || "").then(() =>
          but10bisSufersalVoucher(app, body.user.id, user, "100")
        );
        const result = await client.views.update(
          updateSuccessView(updateView?.id || "", updateView?.hash || "")
        );
        logger.info("res", { result });
      } catch (error) {
        logger.error(error);
        client.chat.postMessage({
          channel: body.user.id,
          text: `We weren't able to purches voucher for you, check your the video and report error :cry:`,
        });
      }
    }
  );

  return app;
};
