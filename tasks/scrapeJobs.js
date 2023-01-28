import sendEmail from "../utils/sendEmail.js";
import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

import { config } from "../config.js";
import { delay } from "../utils/delay.js";

export async function scrapeJobs(page) {
  // Selector for jobs list
  // ul:nth-child(3)

  // Selector for individual job
  // "ul:nth-child(3) li:nth-child(4) a"

  // rerun with daemon

  try {
    await page.goto(config.mainURL);

    await page.waitForSelector("#job-details");
  } catch (error) {
    console.log(error);
    page.screenshot({ path: "error.png" });
  }

  const jobsEl = await page.waitForSelector("ul:nth-child(3)");
  const jobsCount = await jobsEl.evaluate((job) => job.children.length);

  const jobs = [];
  let sentJobs = [];
  const excludedJobs = [];

  while (true) {
    await delay(10000);
    let start = 0;

    let clearMessage = setLoadingMessage("Searching for jobs.", chalk.blue);

    for (let i = 1; i <= jobsCount; i++) {
      try {
        await page.waitForSelector(".jobs-search-no-results-banner", {
          timeout: 3000,
          hidden: true,
        });
      } catch (error) {
        clearMessage(`End of search. ${jobs.length} job(s) found.`, true);

        if (sentJobs.length !== jobs.length) {
          sentJobs = jobs.slice(0);
          await sendEmail(jobs, excludedJobs.length);
        } else {
          console.log("No new jobs found");
        }

        break;
      }

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

      const matchesFilter = config.customFilters.some((cond) =>
        val.title.toLowerCase().includes(cond.toLowerCase())
      );
      const newJob = !jobs.some((job) => job.href === val.href);

      if (matchesFilter) {
        excludedJobs.push(val);
      } else {
        if (newJob) {
          jobs.push(val);
        }
      }

      if (jobsCount === i) {
        clearMessage(`Searching for jobs. ${jobs.length} job(s) found.`);
        i = 1;
        start = start + 950;
        await page.goto(`${config.mainURL}&start=${start}`);
        clearMessage = setLoadingMessage(
          `Searching for jobs. ${jobs.length} job(s) found.`,
          chalk.blue
        );
      }
    }
  }
}
