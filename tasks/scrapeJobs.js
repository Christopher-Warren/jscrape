import sendEmail from "../utils/sendEmail.js";
import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

import { config } from "../config.js";
import { delay } from "../utils/delay.js";

export async function scrapeJobs(page) {
  let totalPasses = 0;

  console.log(
    `Beginning search for ${chalk.cyan(`${config.searchKeywords}`)} jobs.`
  );
  console.log(
    chalk.yellow(
      `Excluding all jobs that contain ${chalk.white(
        config.customTitleFilters.map((i) => " " + i)
      )}`
    )
  );

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

  // Run infinitely
  for (;;) {
    totalPasses > 0 && (await delay(60000 * config.searchInterval)); // 30 minutes
    let start = 0;

    let clearMessage = setLoadingMessage("Searching for jobs.", chalk.blue);

    for (let i = 1; i <= jobsCount; i++) {
      try {
        await page.waitForSelector(".jobs-search-no-results-banner", {
          timeout: 3000,
          hidden: true,
        });
      } catch (error) {
        clearMessage(
          `${jobs.length} job(s) found. Done. Waiting ${config.searchInterval} minutes until next search.`,
          true
        );
        totalPasses++;

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

      const matchesFilter = config.customTitleFilters.some((cond) =>
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
        start += 25; // 25 job results per page
        await page.goto(`${config.mainURL}&start=${start}`);
        clearMessage = setLoadingMessage(
          `Searching for jobs. ${jobs.length} job(s) found.`,
          chalk.blue
        );
      }
    }
  }
}
