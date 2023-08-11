import cron from "node-cron";
import sendEmail from "../utils/sendEmail.js";

import { config } from "../config.js";
import { delay } from "../utils/delay.js";

import Storage from "node-storage";

import chalk from "chalk";
import logUpdate from "log-update";
import {
  clickNextPage,
  getJobsLength,
  getPagesLength,
} from "../utils/linkedinHelpers.js";

export async function scrapeJobs(page) {
  const searchUrls = config.searchUrls;

  cron.schedule(`*/${config.searchInterval} * * * *`, jobSearch, {
    runOnInit: true,
  });

  async function jobSearch() {
    for (const url of searchUrls) {
      const jobs = [];
      let filteredJobs = 0;

      // Load initial page
      try {
        await page.goto(url, { waitUntil: "networkidle2" });
        await page.waitForSelector("#job-details");
      } catch (error) {
        console.log(error);
        throw error;
      }

      logUpdate("Searching... ");

      const totalPages = await getPagesLength(page);

      // Iterate through pages
      for (let i = 1; i <= totalPages; i++) {
        const numOfJobs = await getJobsLength(page);
        logUpdate(
          `Searching... Page ${i} of ${totalPages}. Jobs on this page: ${numOfJobs}`
        );

        // Iterate through job list
        for (let j = 1; j <= numOfJobs; j++) {
          const newJob = await getJob(page, j);
          if (newJob) {
            jobs.push(newJob);
          } else {
            filteredJobs++;
          }
        }

        const nextPage = await clickNextPage(page, i + 1);
        if (!nextPage) {
          const message = await sendNewJobs({ jobs, filteredJobs });
          logUpdate(message);
        } else {
          logUpdate("Searching... Going to next page!");
        }
      }
      // console.log("Done!");
    }
  }
}

async function getJob(page, i) {
  try {
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

    const postedBy = await page.$eval(
      `ul:nth-child(3) li:nth-child(${i}) span`,
      (el) => el.innerText
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

    const blacklist = config.blacklist;
    // Filter jobs by title
    for (const keyword of blacklist) {
      if (val.title.toLowerCase().includes(keyword)) {
        return;
      }
    }
    // Filter jobs by postedBy
    for (const keyword of config.postedByBlacklist) {
      if (postedBy.toLowerCase().includes(keyword)) {
        return;
      }
    }
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
      val.postedBy = postedBy;
      // Filter by other content

      return val;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function sendNewJobs({ jobs, filteredJobs }) {
  try {
    const store = new Storage("./store.json");
    if (jobs.length > 0) {
      // need to refactor email so it's not responsible for generating
      // a message. Instead, it should return the # of jobs sent

      const emailMessage = await sendEmail(jobs, filteredJobs);

      const sentJobs = store.get("jobs");

      store.put("jobs", [...sentJobs, ...jobs]);

      return `${emailMessage} Waiting ${chalk.yellow(
        config.searchInterval
      )} minutes until next search.`;
    } else {
      return `No new jobs found. Filtered ${filteredJobs} jobs. Waiting ${chalk.yellow(
        config.searchInterval
      )} minutes until next search.`;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
