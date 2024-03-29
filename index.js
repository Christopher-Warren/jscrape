import * as dotenv from "dotenv";
dotenv.config();

import puppeteer from "puppeteer-extra";
import PortalPlugin from "puppeteer-extra-plugin-portal";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initStorage } from "./lib/initStorage.js";
import { getLinkedInJobs } from "./tasks/getLinkedInJobs.js";
import logUpdate from "log-update";
import { delay } from "./utils/delay.js";
import { sendNewJobs } from "./tasks/scrapeJobs.js";

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

await getLinkedInJobs();
