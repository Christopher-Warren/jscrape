import * as dotenv from "dotenv";
dotenv.config();

import puppeteer from "puppeteer-extra";
import PortalPlugin from "puppeteer-extra-plugin-portal";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initStorage } from "./lib/initStorage.js";
import { getLinkedInJobs } from "./tasks/getLinkedInJobs.js";

import cron from "node-cron";

initStorage();

puppeteer.use(StealthPlugin());
puppeteer.use(
  PortalPlugin({
    webPortalConfig: {
      listenOpts: {
        port: process.env.PORT || 3200,
      },
      baseUrl: process.env.PORT
        ? "https://jscrape.onrender.com"
        : "http://localhost:3200",
    },
  })
);

// cron.schedule(
//   "*/30 * * * *",
//   () => {
//     console.log("running a task every minute");
//   },
//   { runOnInit: true }
// );
await getLinkedInJobs();
