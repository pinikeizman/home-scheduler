import config from "../config";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import logger from "../logger";
import { AddJob, Context } from "../scheduler";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

export const getUserTransaction: (
  userToken: string
) => Promise<GetUserTransactionResponse> = async (userToken) =>
  axios
    .get("https://www.10bis.co.il/NextApi/UserTransactionsReport", {
      headers: { "user-token": userToken },
    })
    .then((res) => res.data);

export const use10BisBeforeExpiration = async (
  { notify }: Context,
  userToken: string
) => {
  const userTransaction = await getUserTransaction(userToken);
  const endDateStr = userTransaction.Data.companyReportRange.endDateStr;
  const expirationDate = dayjs(endDateStr, "DD.MM.YY");
  const tomorrow = dayjs().add(1, "day");

  const data = {
    period: userTransaction.Data.companyReportRange,
    balances: userTransaction.Data.moneycards.map((c) => c.balance),
  };
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "10Bis utilization report",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`${JSON.stringify(data, null, 2)}\`\`\``,
      },
    },
  ];
  const msgText = "10Bis utilization status";

  if (expirationDate.isBefore(tomorrow)) {
    logger.info("Initiating utilization sequence");
    notify({
      text: msgText,
      blocks: [
        ...blocks,
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Initiating utilization sequence.",
          },
        },
      ],
    });
  } else {
    notify({
      text: msgText,
      blocks: [
        ...blocks,
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `10Bis Check: Period ends *${dayjs().to(expirationDate)}*.`,
          },
        },
      ],
    });
  }
};

export type GetUserTransactionResponse = {
  Success: boolean;
  Data: {
    companyReportRange: {
      dateBias: number;
      companyAnnouncement: string;
      startDateStr: string;
      endDateStr: string;
      compnayPayDay: number;
    };
    moneycards: {
      cardDeleted: boolean;
      cardSuffix: string;
      limitation: {
        monthly: number;
        daily: number;
        weekly: number;
        hideDailyLimit: boolean;
        showWeeklyLimit: boolean;
      };
      balance: {
        daily: number;
        hideDailyLimit: boolean;
        monthly: number;
        showWeeklyLimit: boolean;
        weekly: number;
      };
    }[];
  };
};
export const createJob = (userToken: string): AddJob => ({
  name: "10Bis Period Reminder",
  expression: "0 12 * * *",
  description:
    "Will remined you when the period is about to end and will buy sufersal credits with the remainings",
  cb: (ctx) => use10BisBeforeExpiration(ctx, userToken),
});

export default {
  getUserTransaction,
  createJob,
};
