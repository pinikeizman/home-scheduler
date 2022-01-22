import { App } from "@slack/bolt";
import os from "os";
import { AddJob } from "../scheduler";
import { createMDSection } from "../slack";

export const createJob = (app: App, channel: string): AddJob => ({
  name: "Heartbeat",
  description: "Heartbeat to signal application is alive",
  expression: "0 */1 * * *",
  cb: () =>
    app.client.chat.postMessage({
      channel,
      text: "Heartbeat",
      blocks: [
        createMDSection({
          os: process.platform,
          hostname: os.hostname(),
          upTime: os.uptime(),
          stats: { freeMem: os.freemem(), loadAvg: os.loadavg() },
        }),
      ],
    }),
});

export default {
  createJob,
};
