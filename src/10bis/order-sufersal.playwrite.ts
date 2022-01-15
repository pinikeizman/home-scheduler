import {
  expect,
  firefox as chromium,
  PlaywrightTestArgs,
} from "@playwright/test";
import { App } from "@slack/bolt";
import { createReadStream } from "fs";
import config from "../config";
import logger from "../logger";

export const myfunc = async (app: App, responedToChannel: string) => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ recordVideo: { dir: "videos/" } });
  await context.addCookies([
    {
      name: "uid",
      value: config.TENBIS_USER_TOKEN || "",
      url: "https://www.10bis.co.il",
    },
  ]);
  const page = await context.newPage();
  try {
    await page.goto(
      "https://www.10bis.co.il/next/restaurants/menu/delivery/26698/%D7%A9%D7%95%D7%A4%D7%A8%D7%A1%D7%9C---%D7%9B%D7%9C%D7%9C-%D7%90%D7%A8%D7%A6%D7%99"
    );
    await page.locator(".wm-close-link").click({ force: true }).catch(logger.error);
    await page
      .locator('text=שובר בשווי 100 ש"ח באיסוף עצמי')
      .click({ force: true });
    await page.locator('[data-test-id="submitDishBtn"]').click({ force: true });
  } catch (e) {
    logger.error("Error running playwrite", e);
  }
  const path = (await page?.video()?.path()) || "";
  await context.close();
  const result = await app.client.files.upload({
    filename: path,
    channels: responedToChannel,
    title: `${page.context.name} finished successfully.`,
    file: createReadStream(path),
  });
  logger.info("Send run video successfully", { result });
  await browser.close();
};
