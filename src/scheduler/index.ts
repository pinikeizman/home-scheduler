import schedule, { Job } from "node-schedule";
import { sendSlackMessage } from "../slack";
import logger from "../logger";

export type Context = {
  notify: (options: Record<string, any>) => void;
  job?: Job;
};

export type AddJob = {
  name: string;
  description?: string;
  cb: (ctx: Context) => void;
  expression: string;
};

export type Scheduler = {
  add: (params: AddJob) => Job;
};

const context: Context = {
  notify: ({ text, blocks }) => sendSlackMessage(text, blocks),
};

export const scheduler: Scheduler = {
  add: ({ name, cb, expression, description }) => {
    const job = schedule.scheduleJob(expression, () => {
      try {
        logger.info("Runnin job in scheduler", {
          name,
          expression,
          description,
          nextInvocation: job.nextInvocation(),
        });
        cb({ ...context, job });
      } catch (e) {
        context.notify({ text: `${name} failed!\n${e}` });
      }
    });
    logger.info("Adding job to scheduler", {
      name,
      expression,
      description,
      nextInvocation: job.nextInvocation(),
    });
    return job;
  },
};

export default scheduler;
