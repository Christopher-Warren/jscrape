import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import puppeteer from "puppeteer-extra";
import PortalPlugin from "puppeteer-extra-plugin-portal";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { getLinkedInJobs } from "./tasks/getLinkedInJobs.js";

const app = express();

app.listen(process.env.PORT || 3000);

puppeteer.use(StealthPlugin());
puppeteer.use(
  PortalPlugin({
    webPortalConfig: {
      listenOpts: {
        port: process.env.PORT || 3000,
      },
      baseUrl: process.env.PORT
        ? "https://portal-test-12.onrender.com"
        : "http://localhost:3000",
    },
  })
);

await getLinkedInJobs();
