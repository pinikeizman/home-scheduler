import { ScheduledTask } from "node-cron";
import cron from "node-cron";
import { sendSlackMessage } from "../slack";

export type Context = {
  notify: (options: Record<string, any>) => void;
};

export type Job = {
  name: string;
  description: string;
  run: (context: Context) => void;
};

export type Scheduler = {
  add: (job: Job, expression: string) => ScheduledTask;
};

const context: Context = {
  notify: ({ text, blocks }) => sendSlackMessage(text, blocks),
};

export const scheduler: Scheduler = {
  add: (job, expression) => {
    return cron.schedule(expression, () => {
      try {
        job.run(context);
      } catch (e) {
        context.notify({text:`${job.name} failed!\n${e}`})
      }
    });
  },
};

export default scheduler;
