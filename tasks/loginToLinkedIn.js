import chalk from "chalk";
import { setLoadingMessage } from "../utils/setLoadingMessage.js";

export async function loginToLinkedIn(page) {
  console.log(chalk.magenta("Logging into LinkedIn..."));
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

    // 1
    const clearMessage = setLoadingMessage(
      `Waiting for user to verify - ${portalUrl}`,
      chalk.magenta
    );

    await page.waitForSelector('a[href="/in/christopher-warren-188b2180/"]', {
      timeout: 86400 * 1000, // 24 hours
    });

    // 2
    clearMessage("✔ Verification successful.");

    await page.closePortal();
  }
}
