import cron from "node-cron";
import sendEmail from "../utils/sendEmail.js";

import { config } from "../config.js";
import { delay } from "../utils/delay.js";

import Storage from "node-storage";

import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

export async function scrapeJobs(page) {
  const jobsCount = 25; // 25 jobs per page
  const searchUrls = config.searchUrls;

  cron.schedule(`*/${config.searchInterval} * * * *`, jobSearch, {
    runOnInit: true,
  });

  async function jobSearch() {
    for (const url of searchUrls) {
      let jobsLookedAt = 0;
      let start = 0;
      const jobs = [];
      const excludedJobs = [];
      let totalFoundJobs;

      try {
        await page.goto(url);
        await page.waitForSelector("#job-details");
        totalFoundJobs = await page.$eval(
          ".jobs-search-results-list__subtitle",
          (el) => parseInt(el.innerText)
        );
      } catch (error) {
        console.log(error);
      }

      // const clearLoadingMessage = setLoadingMessage(
      //   "Searching for jobs...",
      //   chalk.blue
      // );

      for (let i = 1; i <= jobsCount; i++) {
        // As long as "No matching jobs found." is not present continue running.
        // document.querySelector('.scaffold-layout__list-container').children.length
        jobsLookedAt++;
        const numOfJobs = await page.$eval(
          ".scaffold-layout__list-container",
          (el) => el.children.length
        );

        if (jobsLookedAt === totalFoundJobs) {
          console.log(jobsLookedAt);
          break;
        }

        // try {
        //   await page.waitForSelector(".jobs-search-no-results-banner", {
        //     timeout: 3000,
        //     hidden: true,
        //   });
        // } catch (error) {
        //   const message = await sendNewJobs({ jobs, excludedJobs });
        //   clearLoadingMessage(message);
        //   console.log(message);
        //   break;
        // }

        // try {
        //   await updateJobs(page, i, { jobs, excludedJobs });
        // } catch (error) {
        //   const message = await sendNewJobs({ jobs, excludedJobs });
        //   clearLoadingMessage(message);

        //   break;
        // }

        // Go to next page when at end
        if (i === jobsCount) {
          console.log("going to next page", jobsLookedAt);
          console.log(
            totalFoundJobs + " totalFoundJobs",
            numOfJobs + " numOfJobs",
            start + " start",
            jobs.length + " j.length"
          );

          i = 1;
          start += 25; // 25 job results per page
          await page.goto(`${url}&start=${start}`);
        }
      }
    }
  }
}

async function updateJobs(page, i, { jobs, excludedJobs }) {
  const store = new Storage("./store.json");

  const jobContainer = await page.waitForSelector(
    `ul:nth-child(3) li:nth-child(${i})`,
    { timeout: 5000 }
  );

  // Scroll to job listing
  await jobContainer.evaluate((el) => el.scrollIntoView());

  // Wait for job listing link to load
  const jobListing = await page.waitForSelector(
    `ul:nth-child(3) li:nth-child(${i}) a`,
    { timeout: 5000 }
  );

  // The job listing element
  const val = await jobListing.evaluate((el) => {
    // Parse link for readablility
    const arrOfUrl = el.href.split("/");
    // Get id
    const jobId = arrOfUrl[5];
    // remove params
    arrOfUrl.pop();
    const url = arrOfUrl.join("/");

    return { title: el.innerText, href: url, id: jobId };
  });

  // Check if job already exists or has been sent already
  const jobSent = store.get("jobs").some((i) => i.id === val.id);

  if (!jobSent) {
    await jobListing.click();
    await delay(500);
    const bodyEl = await page.waitForSelector("#job-details");

    const { body } = await bodyEl.evaluate((el) => {
      return { body: el.innerHTML };
    });

    val.body = body;

    // Can filter here if wanted
    jobs.push(val);
  } else {
    excludedJobs.push(val);
  }
}

async function sendNewJobs({ jobs, excludedJobs }) {
  const store = new Storage("./store.json");
  if (jobs.length > 0) {
    const emailMessage = await sendEmail(jobs, excludedJobs.length);

    const previousJobs = store.get("jobs");

    store.put("jobs", [...previousJobs, ...jobs]);

    return `${emailMessage} Waiting ${chalk.yellow(
      config.searchInterval
    )} minutes until next search.`;
  } else {
    return `${chalk.yellow(
      excludedJobs.length
    )} old jobs found. Waiting ${chalk.yellow(
      config.searchInterval
    )} minutes until next search.`;
  }
}
