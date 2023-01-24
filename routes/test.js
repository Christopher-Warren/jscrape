import { Router } from "express";
import path from "path";
import puppeteer from "puppeteer-extra";

import { executablePath } from "puppeteer";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const router = Router();
router.get("/test", async (req, res) => {
  let data;
  await (async () => {
    const browser = await puppeteer.launch({
      executablePath: executablePath(),
    });
    const page = await browser.newPage();

    await page.goto("https://www.chriswarren.tech/about");

    // const bodyHandle = await page.$(
    //   ".space-y-2 > li:nth-child(17) > div:nth-child(1) > span:nth-child(1)"
    // );
    const elHandle = await page.waitForSelector(
      ".space-y-2 > li:nth-child(16) > div:nth-child(1) > span:nth-child(1)"
    );

    // .jobs-search-results-list__list-item--active > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1)
    // #ember1938.jobs-search-results-list__list-item--active > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > a:nth-child(1)
    console.log(elHandle);
    const data = await page.evaluate((el) => el.nodeName, elHandle);
    console.log(data);

    // await page.type(
    //   ".jobs-search-box__text-input",
    //   "junior frontend developer"
    // );
    // await page.keyboard.type("Enter");

    console.log("waiting 3 seconds... ");

    // await page.screenshot({ path: "delete.png" });

    await browser.close();
    res.json({ data });
  })();

  // res.sendFile(path.join(__dirname, "..", "delete.png"));
});

export default router;
