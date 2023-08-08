import { executablePath } from "puppeteer";

import { loginToLinkedIn } from "./loginToLinkedIn.js";
import puppeteer from "puppeteer-extra";
import { scrapeJobs } from "./scrapeJobs.js";

export async function getLinkedInJobs() {
  const browser = await puppeteer.launch({
    executablePath: executablePath(),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  page.setViewport({
    width: 1080,
    height: 1260,
    deviceScaleFactor: 1,
  });

  try {
    await loginToLinkedIn(page);
  } catch (error) {
    await page.screenshot({ path: "./error.png" });
    throw new Error(`There was a problem logging in: ${error}`);
  }

  try {
    await scrapeJobs(page);
  } catch (error) {
    await page.screenshot({ path: "./error.png" });
    throw new Error(`There was a problem scraping jobs: ${error}`);
  }
}
