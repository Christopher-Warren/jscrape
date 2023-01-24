import sendEmail from "../utils/sendEmail.js";
import { baseLinkedInUrl } from "../vars/baseLinkedInUrl.js";
import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";
import { filter } from "../vars/filter.js";
import { config } from "../config.js";

export async function scrapeJobs(page) {
  // Selector for jobs list
  // ul:nth-child(3)

  // Selector for individual job
  // "ul:nth-child(3) li:nth-child(4) a"

  const jobsEl = await page.waitForSelector("ul:nth-child(3)");
  const jobsCount = await jobsEl.evaluate((job) => job.children.length);

  const jobs = [];

  let start = 0;

  let clearMessage = setLoadingMessage("Searching for jobs", chalk.blue);

  for (let i = 1; i <= jobsCount; i++) {
    const jobContainer = await page.waitForSelector(
      `ul:nth-child(3) li:nth-child(${i})`
    );
    await jobContainer.evaluate((el) => el.scrollIntoView());

    const jobListing = await page.waitForSelector(
      `ul:nth-child(3) li:nth-child(${i}) a`
    );
    const val = await jobListing.evaluate((el) => {
      return { title: el.innerText, href: el.href };
    });

    console.log(val);

    filter.map((cond) => {
      if (val.title.toLowerCase().includes(cond)) {
        console.log("adding job..", val);
        jobs.push(val);
      } else {
        // console.log();
      }
    });

    if (jobsCount === i) {
      clearMessage(`${jobs.length} job(s) found!. Going to next page...`);
      i = 1;
      start = start + 25;
      await page.goto(`${config.mainURL}&start=${start}`);
      clearMessage = setLoadingMessage("Searching for jobs", chalk.blue);
    }
  }
}
