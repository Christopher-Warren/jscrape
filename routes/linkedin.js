import { Router } from "express";
import path from "path";
import puppeteer from "puppeteer-extra";
import { executablePath } from "puppeteer";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import { loginToLinkedIn } from "../tasks/loginToLinkedIn.js";
import { scrapeJobs } from "../tasks/scrapeJobs.js";

import chalk from "chalk";
import { filter } from "../vars/filter.js";

const router = Router();
router.get("/linkedin", async (req, res) => {
  await (async () => {
    const browser = await puppeteer.launch({
      executablePath: executablePath(),
    });
    const page = await browser.newPage();

    page.setViewport({
      width: 1080,
      height: 1260,
      deviceScaleFactor: 1,
    });

    await loginToLinkedIn(page);

    console.log(
      chalk.yellow(
        `Ignoring all jobs that contain ${chalk.white(
          filter.map((i) => i + " ")
        )}`
      )
    );

    await scrapeJobs(page);

    await page.screenshot({ path: "delete.png" });
    await browser.close();
  })();

  res.sendFile(path.join(__dirname, "..", "delete.png"));
});

export default router;
