import { firefox as chromium } from "@playwright/test";
import { App } from "@slack/bolt";
import { createReadStream } from "fs";
import { createMDSection } from "../slack";
import { User } from "../database";
import logger from "../logger";

export const scheduleMyvisit = async (
  app: App,
  responedToChannel: string,
  // user: User,
  // amount: "100"
) => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ recordVideo: { dir: "videos/" } });
  await context.addInitScript(()=>{
    window.localStorage.setItem("user.tkn", "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InljeDFyWFRmalRjQjZIQWV1aGxWQklZZmZUbyJ9.eyJpc3MiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJhdWQiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJuYmYiOjE2NTE2NDE3MDMsImV4cCI6MTY4Mjc0NTcwMywidW5pcXVlX25hbWUiOiI0N2U4Njk5Zi03Yjg3LTRjZmEtOGFhZC1hYzQ4OGMxNjUzZTkifQ.qhgxwQKDMQcHvSEzb_JI-fBUUtL1tkV2RKTbLVBcdRI291JvLL6XebvJFaYsPtyScNAP3070WUCYTy7v2eNz9C4VsrtkD2zIEslZ4NCaFNTLVBrI1bTgyjKB_uDpukxESVhMUi7FScbJKCy0PKktw68eKyLKnDW3ck20XISU2Z1bFwRgL0tk-BFFVSfPmIIF3bJx0OeqV1emzbi1hfpfuN1uR5ObRKkUSI6FWaBoZuehZ7esTPbtlDN2sE_-_96hq4i4FkzIwWwsfExC1APL6OBeghDSucSBdmBWosRdxcrdDnEPC6rV2GagkyxU6mKmjyy5Z2btQlW8oyb5Tt7wvQ")
    window.localStorage.setItem("_grecaptcha", "09ABpmNwKHW5R6ldoMaRp3uUsWragkms5wRonPSDqQmBjRz6nsCnKYuGNoqS3w_UElsYUImGqDgXv4-owNUWR2jHDKEA")
  })
  await context.addCookies([
    {
      name: "ARRAffinity",
      value: "d9df031e81821590596661677f0340cdcd45bcc17282bb769503aea68b6b472e",
      url: "https://myvisit.com/",
      secure: true,
      httpOnly:true,
    }, 
    {
      name: "ARRAffinitySameSite",
      sameSite:'None',
      secure: true,
      httpOnly:true,
      value: "d9df031e81821590596661677f0340cdcd45bcc17282bb769503aea68b6b472e",
      url: "https://myvisit.com/",
    },
    {
      name: "mvlng",
      value: "en",
      url: "https://myvisit.com/",
    }, 
    {
      name: "_ga",
      value: "GA1.2.1986118553.1651641671",
      url: "https://myvisit.com/",
    },
    {
      name: "_gid",
      value: "GA1.2.1425147708.1651641671",
      url: "https://myvisit.com/",
    },
    {
      name: "mvcnm",
      value: "Israel",
      url: "https://myvisit.com/",
    }, 
    {
      name: "mvcid",
      value: "1",
      url: "https://myvisit.com/",
    },
    {
      name: "mvcc",
      value: "il",
      url: "https://myvisit.com/",
    },
  ]);
  const page = await context.newPage();
  try {
    // await page.goto(
    //   "https://myvisit.com/#!/home/service/2095", {waitUntil:'networkidle'}
    // );
    await page.goto(
      "https://myvisit.com/#!/home/service/4706", {waitUntil:'networkidle', timeout: 60000}
    );
    await page
    .fill('#ID_KEYPAD', '234389013')
    await page.locator('button', { hasText: 'Continue'}).click();
    await page
    .fill('#PHONE_KEYPAD', '0547744151')
    await page.locator('button', { hasText: 'Continue'}).click();
    await page.waitForSelector('#listCheckBox', { state: 'attached' });
    await page.locator('#listCheckBox li' , { hasText: 'ראשון'}).click();
    await page.waitForLoadState('networkidle')
    // await page.waitForSelector('.calendarDay:not([aria-hidden="true"])');
    // const availableDates = await page.locator('.calendarDay:not([aria-hidden="true"])')
    await page.waitForSelector('li.picker-body li');
    const availableDates = await page.locator('li.picker-body li')
    const datesCount = await availableDates.count()
    const res: Record<string,string> = {}
    for (let i = 0; i < datesCount; ++i){
      const currentDateButton = await availableDates.nth(i)//.locator('xpath=../..')
      const dateStringRaw = await currentDateButton.getAttribute('aria-label') || ""
      const dateString = dateStringRaw//dateStringRaw.join("").replace(/[ \n]/g,"")
      try{
        await currentDateButton.scrollIntoViewIfNeeded({timeout: 1000})
        await currentDateButton.click({timeout: 3000})
        const availableSlots = await page.locator('.TimeButton')
        const slotsCount = (await availableSlots.allTextContents()).join("").replace(/[ \n]/g,"")
        res[dateString] = slotsCount
      }catch(e){
        logger.error(`Error collecting slots for date: ${dateString}`, e, currentDateButton.getAttribute('aria-label'));
      }
    }
      app.client.chat.postMessage({
      channel: responedToChannel,
      text: "Passport available slots report",
      blocks: [
        createMDSection(res),
      ],
    })
    //   .catch(logger.error);
    // await page.locator('[data-test-id="submitDishBtn"]').click({ force: true });
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
