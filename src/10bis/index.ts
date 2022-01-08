import config from "../config";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import logger from "../logger";
import { AddJob, Context } from "../scheduler";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

const userToken = config.TENBIS_USER_TOKEN || "";

export const getUserTransaction: () => Promise<GetUserTransactionResponse> =
  async () =>
    axios
      .get("https://www.10bis.co.il/NextApi/UserTransactionsReport", {
        headers: { "user-token": userToken },
      })
      .then((res) => res.data);

export const use10BisBeforeExpiration = async ({ notify }: Context) => {
  const userTransaction = await getUserTransaction();
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
    logger.info("There's still time");
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
export const createJob = (): AddJob => ({
  name: "10Bis Period Reminder",
  expression: "0 12 * * *",
  description:
    "Will remined you when the period is about to end and will buy sufersal credits with the remainings",
  cb: use10BisBeforeExpiration,
});

export default {
  getUserTransaction,
  createJob,
};
