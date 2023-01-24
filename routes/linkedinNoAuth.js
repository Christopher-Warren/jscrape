import { Router } from "express";
import path from "path";
import puppeteer from "puppeteer-extra";
import { executablePath } from "puppeteer";

import sendEmail from "../utils/sendEmail.js";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const router = Router();
router.get("/linkedin/noauth", async (req, res) => {
  await (async () => {
    const browser = await puppeteer.launch({
      executablePath: executablePath(),
    });
    const page = await browser.newPage();

    page.setViewport({
      width: 1200,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.goto(
      "https://www.linkedin.com/jobs/search?keywords=junior frontend developer&location=United%20States&locationId=&geoId=103644278&f_TPR=r604800&f_WT=2&position=1&pageNum=0",
      {
        waitUntil: "networkidle0",
      }
    );

    // Get number of jobs
    const jobsEl = await page.waitForSelector("section > ul");
    const jobsCount = await jobsEl.evaluate((job) => job.children.length);

    const jobs = [];

    const filterTerms = ["intern"];

    for (let i = 1; i <= jobsCount; i++) {
      const jobConainer = await page.waitForSelector(`ul > li:nth-child(${i})`);
      await jobConainer.evaluate((el) => el.scrollIntoView());

      const jobListing = await page.waitForSelector(
        `ul > li:nth-child(${i}) a`
      );
      const val = await jobListing.evaluate((el) => {
        return { title: el.innerText, href: el.href };
      });

      filterTerms.map((cond) => {
        if (val.title.toLocaleLowerCase().includes(cond)) {
          jobs.push(val);
        } else {
          console.log(val.title, "not included");
        }
      });
    }
    // await sendEmail(jobs);

    console.log(jobs);

    // Check job title
    // const el = await page.waitForSelector("ul > li:nth-child(1) a");
    // const val = await el.evaluate((el) => {
    //   if (el.innerText.includes("Intern")) return { no: "inter" };
    //   return { title: el.innerText, href: el.href };
    // });
    // console.log(val);

    // Check job data
    // await page.click("ul > li:nth-child(1) a");
    // await page.waitForNetworkIdle();
    // const descriptionEl = await page.waitForSelector(".description__text");
    // const descriptionVal = await descriptionEl.evaluate((el) => el.innerText);

    await page.screenshot({ path: "delete.png" });
    await browser.close();
  })();

  res.sendFile(path.join(__dirname, "..", "delete.png"));
});

export default router;
