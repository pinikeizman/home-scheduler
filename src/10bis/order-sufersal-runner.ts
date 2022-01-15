import cypress from "cypress";
// import globby from "globby";
import Bluebird from "bluebird";
import fs from "fs";
import logger from "../logger";
import path from "path";
import { App } from "@slack/bolt";
import config from "../config";
import { createReadStream } from "fs";

/**
 * Sorts by "time" property, putting larger numbers first
 */
type FileAndLastModified = {
  filename: string;
  time: number;
};

const byTime = (a: FileAndLastModified, b: FileAndLastModified) =>
  b.time - a.time;

const sortByLastModified = (filenames: string[]) => {
  const withTimes: FileAndLastModified[] = filenames.map((filename) => {
    return {
      filename,
      time: fs.statSync(filename).mtime.getTime(),
    };
  });

  return withTimes.sort(byTime);
};

const runOneSpec = (spec: FileAndLastModified) => {
  return cypress.run({
    config: {
      video: true,
      defaultCommandTimeout: 10000,
    },
    spec: spec.filename,
  });
};

export const run10BisCypress = async ({
  app,
  responedToChannel,
}: {
  app: App;
  responedToChannel?: string;
}) => {
  const test_path = path.join(__dirname, "order-sufersal.cy.ts");
  const specs = await Bluebird.resolve([test_path]).then(sortByLastModified);
  const runResults = await Bluebird.mapSeries(specs, runOneSpec);
  runResults.forEach(async (runResult) => {
    if (runResult.status === "failed") {
      const failedRunResult =
        runResult as CypressCommandLine.CypressFailedRunResult;
      logger.error("Cypress run failed!", { failedRunResult });
    } else {
      const successRunResult = runResult as CypressCommandLine.CypressRunResult;
      logger.error("Cypress run succeeded!", { successRunResult });
      const channel =
        (responedToChannel && { id: responedToChannel }) ||
        (await app.client.conversations
          .list()
          .then((res) =>
            res?.channels?.find(
              (c) => c.name === config.SLACK_NOTIFICATION_CHANNEL
            )
          ));
      if (!channel) {
        throw new Error(
          `Channel ${config.SLACK_NOTIFICATION_CHANNEL} not found!`
        );
      }
      successRunResult.runs.forEach(async (run) => {
        if (run.video) {
          const result = await app.client.files.upload({
            filename: run.video.split("/").reverse()[0],
            channels: channel.id,
            title: `${run.spec.name} finished successfully.`,
            file: createReadStream(run.video),
          });
          logger.info("Send run video successfully", { result });
        }
      });
    }
  });
};
