export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/",
  searchFilters: "?f_TPR=r86400&f_WT=2&keywords=", // Applies linked in filters 1) date posted: past 24 hrs and 2) remote only
  searchKeywords: "junior frontend developer", // The job to search for on linkedin
  customTitleFilters: [
    // Any jobs that include these terms in the title will be omitted in result
    "sr.",
    "sr",
    "senior",
    "II",
    "2",
    ".net",
    "principal",
    "staff",
    "ruby",
    "scala",
    "lead",
    "devops",
    "aem",
    "kafka",
    "designer",
    "architect",
    "store",
    "manager",
    "angular",
    "elixir",
    "consultant",
    "endpoint engineer",
    "metals",
    "python",
    "volunteer:",
    "volunteer",
    "tableau",
    "c#",
    "ServiceNow",
  ],
  mainURL: null,
  searchInterval: 10, // Time in minutes that the search will execute
};
config.mainURL = encodeURI(
  `${config.baseSearchURL}${config.searchFilters}${config.searchKeywords}`
);
