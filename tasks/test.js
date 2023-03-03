import { executablePath } from "puppeteer";

import puppeteer from "puppeteer-extra";

export async function test() {
  const browser = await puppeteer.launch({
    executablePath: executablePath(),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  page.setViewport({
    width: 1080,
    height: 1260,
    deviceScaleFactor: 1,
  });

  await page.goto(
    "https://www.linkedin.com/jobs/search?trk=guest_homepage-basic_guest_nav_menu_jobs&position=1&pageNum=0"
  );

  await page.screenshot({ path: "screenshot.png" });

  const select = await page.waitForSelector(".show-more-less-html");

  const body = await select.evaluate((el) => {
    return { body: el.innerHTML, el: el };
  });
  body.a = "lkdjnlsdkjng";
  console.log(body);
}
