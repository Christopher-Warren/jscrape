# Jscrape - LinkedIn

![license](https://img.shields.io/github/license/Christopher-Warren/jscrape?style=flat-square)

A Node application that uses puppeteer to log into LinkedIn and scrape job listings based on custom parameters provided by the user and emails the user the results.

## Use case

Searching for jobs on LinkedIn can be a painful process. If you search for "software engineer" you will get back a plethora of jobs that you simply aren't interested in. With the number of remote jobs available, this problem is exaggerated and you end up wasting a lot of time sifting through irrelevant jobs.

This tool is a solution to that and helps save time by only providing links to jobs that you care about.

## Install & Run

> :warning: **An email server is required**: See [well known services](https://nodemailer.com/smtp/well-known/) for a list of potential email providers

1. Fork or clone this repo
2. Run `npm install`
3. Rename `.env.example` to `.env` and enter your data
   `NODEMAILER` variables can be obtained from your email provider
4. Modify `config.js` to whatever conditions you would like
5. Run `npm start` to start the server

## Configuration

The important values to set here are `customTitleFilters` and `searchKeywords`.

By default, the app will search every 30 minutes and only return new jobs found since starting the server. You can change the time in which jobs are scraped by changing `searchInterval`

Additionally, `searchFilters` are the filters provided by LinkedIn. By default, only Remote jobs posted within the past day are queried. I may provide an easier way to change this in the future.

```js
export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/",
  searchFilters: "?f_TPR=r86400&f_WT=2&keywords=", // Applies linked in filters 1) date posted: past 24 hrs and 2) remote only
  searchKeywords: "sweet software job", // The job to search for on linkedin
  customTitleFilters: ["sr.", "senior"], // Any jobs that include these terms in the title will be omitted in result
  searchInterval: 30, // Time interval in minutes that the search will execute
};
```
