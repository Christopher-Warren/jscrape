import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import puppeteer from "puppeteer";

const app = express();

app.listen(process.env.PORT || "4000");

app.get("/hello", (req, res) => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.linkedin.com/home");

    // Type into search box.
    await page.type("#session_key", process.env.LINKEDIN_UN);
    await page.type("#session_password", process.env.LINKEDIN_PW);

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click(".sign-in-form__submit-button"),
    ]);

    setTimeout(async () => {
      await page.screenshot({ path: "delete.png" });
      await browser.close();
    }, 5000);
  })();

  res.json({ success: true });
});

if (process.env.NODE_ENV === "production") {
  // Allows Express to serve production assets.
  app.use(express.static("client/build"));
  app.get("*", (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
