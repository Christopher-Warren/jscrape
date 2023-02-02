import { config } from "../config.js";

export function initConfig() {
  const params = new URLSearchParams();

  switch (config.timeRange) {
    case "1d":
      params.set("f_TPR", "r86400");
      break;

    case "7d":
      params.set("f_TPR", "r604800");
      break;

    case "1m":
      params.set("f_TPR", "r2592000");
      break;

    default:
      break;
  }

  switch (config.onSiteOrRemote) {
    case "remote":
      params.set("f_WT", "2");
      break;

    case "on-site":
      params.set("f_WT", "1");
      break;

    case "hybrid":
      params.set("f_WT", "3");
      break;

    default:
      break;
  }

  config.mainURL = encodeURI(
    `https://www.linkedin.com/jobs/search/?${params}&keywords=${config.searchKeywords}`
  );
}
