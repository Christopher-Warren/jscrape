import * as dotenv from "dotenv";
dotenv.config();

import puppeteer from "puppeteer-extra";
import PortalPlugin from "puppeteer-extra-plugin-portal";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initStorage } from "./lib/initStorage.js";
import { initConfig } from "./lib/initConfig.js";
import { getLinkedInJobs } from "./tasks/getLinkedInJobs.js";

initConfig();
initStorage();

puppeteer.use(StealthPlugin());
puppeteer.use(
  PortalPlugin({
    webPortalConfig: {
      listenOpts: {
        port: process.env.PORT || 3000,
      },
      baseUrl: process.env.PORT
        ? "https://jscrape.onrender.com"
        : "http://localhost:3000",
    },
  })
);

// await getLinkedInJobs();
