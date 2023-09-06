export const config = {
  searchUrls: [
    "https://www.linkedin.com/jobs/search/?f_T=25170%2C100%2C3172&f_TPR=r86400&f_WT=2&geoId=103644278&keywords=javascript developer&location=United States&refresh=true&sortBy=R",
  ],
  blacklist: [
    "sr.",
    "senior",
    "staff",
    "lead",
    "angular",
    "c#",
    ".net",
    "asp.net",
  ],
  postedByBlacklist: ["braintrust", "pattern learning"],
  searchInterval: 30, // Time in minutes that the search will execute
};
