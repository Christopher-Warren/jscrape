import sendEmail from "../utils/sendEmail.js";
import { config } from "../config.js";
import { delay } from "../utils/delay.js";

import Storage from "node-storage";

export async function scrapeJobs(page) {
  // Is flipped after first run
  let isFirstSearch = true;

  const excludedJobs = [];

  const jobsCount = 25; // 25 jobs per page

  console.log(`Beginning search for ${config.searchKeywords}} jobs.`);

  console.log(
    `Excluding all jobs that contain ${config.excludeFilter.map(
      (i) => " " + i
    )}`
  );
  console.log(
    `Including jobs that contain ${config.includeFilter.map((i) => " " + i)}`
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

    console.log("Searching for jobs...");

    for (let i = 1; i <= jobsCount; i++) {
      // As long as "No matching jobs found." is not present continue running.
      try {
        await page.waitForSelector(".jobs-search-no-results-banner", {
          timeout: 3000,
          hidden: true,
        });
      } catch (error) {
        await sendNewJobs({ jobs, excludedJobs });

        break;
      }

      try {
        await updateJobs(page, i, { jobs, excludedJobs });
      } catch (error) {
        await sendNewJobs({ jobs, excludedJobs });

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
  console.log(excludedJobs.length);
  console.log(jobs.length);
  if (jobs.length > 0) {
    await sendEmail(jobs, excludedJobs.length);

    const previousJobs = store.get("jobs");

    store.put("jobs", [...previousJobs, ...jobs]);

    console.log(
      `Done. Waiting ${config.searchInterval} minutes until next search.`
    );
  } else {
    console.log(
      `No new jobs found. Waiting ${config.searchInterval} minutes until next search.`
    );
  }
}
