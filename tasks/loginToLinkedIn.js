import chalk from "chalk";

export async function loginToLinkedIn(page) {
  console.log(chalk.magenta("Logging into LinkedIn..."));
  await page.goto("https://www.linkedin.com/home");

  // Type into search box.
  await page.type("#session_key", process.env.LINKEDIN_UN);
  await page.type("#session_password", process.env.LINKEDIN_PW);

  await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);

  try {
    await page.waitForSelector('a[href="https://www.linkedin.com/jobs/?"]', {
      timeout: 10000,
    });

    console.log(chalk.magenta("✔ Login successful."));
  } catch (error) {
    const portalUrl = await page.openPortal();

    console.log("Please visit link below and solve captcha");
    console.log(chalk.blue(portalUrl));
    await page.waitForSelector(".search-global-typeahead__input", {
      timeout: 86400 * 1000, // 24 hours
    });

    console.log(chalk.magenta("✔ Verification successful."));

    await page.closePortal();
  }
}
