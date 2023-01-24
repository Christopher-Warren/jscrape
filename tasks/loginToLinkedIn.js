import open from "open";
import { baseLinkedInUrl } from "../vars/baseLinkedInUrl.js";
import chalk from "chalk";
import logUpdate from "log-update";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";
import { filter } from "../vars/filter.js";

import { config } from "../config.js";

export async function loginToLinkedIn(page) {
  await page.goto("https://www.linkedin.com/home");

  // Type into search box.
  await page.type("#session_key", process.env.LINKEDIN_UN);
  await page.type("#session_password", process.env.LINKEDIN_PW);

  await Promise.all([
    page.waitForNavigation(),
    page.click(".sign-in-form__submit-button"),
  ]);

  try {
    await page.waitForSelector('a[href="https://www.linkedin.com/jobs/?"]', {
      timeout: 2000,
    });

    console.log(chalk.magenta("✔ Login successful."));
  } catch (error) {
    const portalUrl = await page.openPortal();

    const clearMessage = setLoadingMessage(
      "Waiting for user to verify",
      chalk.magenta
    );
    await open(portalUrl);
    await page.waitForSelector('a[href="/in/christopher-warren-188b2180/"]', {
      timeout: 86400 * 1000, // 24 hours
    });
    clearMessage("✔ Verification successful.");

    await page.closePortal();
  }

  try {
    await page.goto(config.mainURL);

    await page.waitForSelector("#job-details");
  } catch (error) {
    console.log(error);
    page.screenshot({ path: "error.png" });
  }
}
