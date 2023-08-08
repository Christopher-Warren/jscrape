import cron from "node-cron";
import sendEmail from "../utils/sendEmail.js";

import { config } from "../config.js";
import { delay } from "../utils/delay.js";

import Storage from "node-storage";

import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

export async function scrapeJobs(page) {
  const jobsPerPage = 25;
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

      // Load initial page
      try {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("#job-details");
        totalFoundJobs = await page.$eval(
          ".jobs-search-results-list__subtitle",
          (el) => parseInt(el.innerText)
        );
      } catch (error) {
        console.log(error);
      }

      const resetLoadingMessage = setLoadingMessage(
        "Searching for jobs...",
        chalk.blue
      );

      // Iterate through job listings
      for (let i = 1; i <= jobsPerPage; i++) {
        jobsLookedAt++;
        const newJob = await getJob(page, i);

        if (newJob) jobs.push(newJob);

        // whitelist.forEach((term) => {
        //
        // })

        // End search, send jobs
        if (jobsLookedAt === totalFoundJobs) {
          const message = await sendNewJobs({ jobs, excludedJobs });
          resetLoadingMessage(`${totalFoundJobs} results. ` + message);
          break;
        }

        // Go to next page when at end
        if (i === jobsPerPage) {
          i = 1;
          start += 25; // 25 job results per page
          await page.goto(`${url}&start=${start}`);
        }
      }
    }
  }
}

async function getJob(page, i) {
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

    return val;
  }
  return null;
}

async function sendNewJobs({ jobs, excludedJobs }) {
  const store = new Storage("./store.json");
  if (jobs.length > 0) {
    // need to refactor email so it's not responsible for generating
    // a message. Instead, it should return the # of jobs sent
    const emailMessage = await sendEmail(jobs, excludedJobs.length);

    const sentJobs = store.get("jobs");

    store.put("jobs", [...sentJobs, ...jobs]);

    return `${emailMessage} Waiting ${chalk.yellow(
      config.searchInterval
    )} minutes until next search.`;
  } else {
    return `No new jobs found. Waiting ${chalk.yellow(
      config.searchInterval
    )} minutes until next search.`;
  }
}
