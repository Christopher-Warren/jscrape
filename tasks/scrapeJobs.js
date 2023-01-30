import sendEmail from "../utils/sendEmail.js";
import { config } from "../config.js";
import { delay } from "../utils/delay.js";

export async function scrapeJobs(page) {
  let isFirstSearch = true;

  console.log(`Beginning search for ${config.searchKeywords}} jobs.`);
  console.log(
    `Excluding all jobs that contain ${config.customTitleFilters.map(
      (i) => " " + i
    )}`
  );

  try {
    await page.goto(config.mainURL);

    await page.waitForSelector("#job-details");
  } catch (error) {
    console.log(error);
    page.screenshot({ path: "error.png" });
  }

  let jobsCount = 25; // 25 jobs per page

  const jobs = [];
  let sentJobs = [];
  const excludedJobs = [];

  // Run infinitely
  for (;;) {
    let start = 0;
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
        await sendNewJobs({ jobs, sentJobs, excludedJobs });

        break;
      }

      // updateJobs
      try {
        await updateJobs(page, i, { jobs, sentJobs, excludedJobs });
      } catch (error) {
        await sendNewJobs({ jobs, sentJobs, excludedJobs });

        break;
      }

      // Go to next page
      if (i === jobsCount) {
        i = 1;
        start += 25; // 25 job results per page
        await page.goto(`${config.mainURL}&start=${start}`);
      }
    }
  }
}

async function updateJobs(page, i, { jobs, excludedJobs }) {
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
}

async function sendNewJobs({ jobs, sentJobs, excludedJobs }) {
  console.log(
    `Done. Waiting ${config.searchInterval} minutes until next search.`
  );

  if (sentJobs.length !== jobs.length) {
    sentJobs = jobs.slice(0);
    await sendEmail(jobs, excludedJobs.length);
  } else {
    console.log("No new jobs found");
  }
}
