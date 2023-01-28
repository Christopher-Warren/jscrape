import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import puppeteer from "puppeteer-extra";
import PortalPlugin from "puppeteer-extra-plugin-portal";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import linkedinRoutes from "./routes/linkedin.js";
import linkedinNoAuthRoute from "./routes/linkedinNoAuth.js";
import logUpdate from "log-update";
import cliSpinners from "cli-spinners";

const app = express();

app.listen(process.env.PORT || "3000");

app.use(linkedinRoutes);
app.use(linkedinNoAuthRoute);

puppeteer.use(StealthPlugin());
puppeteer.use(
  PortalPlugin({
    // This is a typical configuration when hosting behind a secured reverse proxy
    webPortalConfig: {
      listenOpts: {
        port: 3001,
      },
      baseUrl: "http://localhost:3001",
    },
  })
);
