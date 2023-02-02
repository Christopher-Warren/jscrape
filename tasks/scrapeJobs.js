import sendEmail from "../utils/sendEmail.js";
import { config } from "../config.js";
import { delay } from "../utils/delay.js";

import Storage from "node-storage";

import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

export async function scrapeJobs(page) {
  // Is flipped after first run
  let isFirstSearch = true;

  const excludedJobs = [];

  const jobsCount = 25; // 25 jobs per page

  console.log(
    `Beginning search for ${chalk.blue(config.searchKeywords)} jobs.`
  );

  console.log(
    `Excluding all jobs that contain ${chalk.yellow(
      config.excludeFilter.map((i) => " " + i)
    )}`
  );
  console.log(
    `Including jobs that contain ${chalk.blue(
      config.includeFilter.map((i) => " " + i)
    )}`
  );

  try {
    await page.goto(config.mainURL);
    await page.waitForSelector("#job-details");
  } catch (error) {
    console.log(error);
  }

  // Run infinitely
  for (;;) {
    let start = 0;
    const jobs = [];

    // No delay for first search after starting server
    if (!isFirstSearch) {
      await delay(60000 * config.searchInterval);
    } else {
      isFirstSearch = false;
    }

    // console.log(chalk.blue("Searching for jobs..."));
    const clearLoadingMessage = setLoadingMessage(
      "Searching for jobs...",
      chalk.blue
    );

    for (let i = 1; i <= jobsCount; i++) {
      // As long as "No matching jobs found." is not present continue running.
      try {
        await page.waitForSelector(".jobs-search-no-results-banner", {
          timeout: 3000,
          hidden: true,
        });
      } catch (error) {
        const message = await sendNewJobs({ jobs, excludedJobs });
        clearLoadingMessage(message);

        break;
      }

      try {
        await updateJobs(page, i, { jobs, excludedJobs });
      } catch (error) {
        const message = await sendNewJobs({ jobs, excludedJobs });
        clearLoadingMessage(message);

        break;
      }

      // Go to next page when at end
      if (i === jobsCount) {
        i = 1;
        start += 25; // 25 job results per page
        await page.goto(`${config.mainURL}&start=${start}`);
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
  // The job element
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

  // Check if job includes ONLY terms we want to see
  const matchesIncludeFilter = config.includeFilter.some((cond) =>
    val.title.toLowerCase().includes(cond.toLowerCase())
  );

  // Check if job contains any terms we DONT want to see
  const matchesExcludeFilter = config.excludeFilter.some((cond) =>
    val.title.toLowerCase().includes(cond.toLowerCase())
  );

  // Check if job already exists or has been sent already
  const jobSent = store.get("jobs").some((i) => i.id === val.id);

  if (!jobSent && matchesIncludeFilter && !matchesExcludeFilter) {
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
    return `No new jobs found. Waiting ${chalk.yellow(
      config.searchInterval
    )} minutes until next search.`;
  }
}
