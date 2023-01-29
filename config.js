export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/",
  searchFilters: "?f_TPR=r86400&f_WT=2&keywords=",
  searchKeywords: "junior frontend developer",
  customTitleFilters: [
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
  ],
  mainURL: null,
  searchInterval: 30, // Time in minutes that the search will execute
};
config.mainURL = encodeURI(
  `${config.baseSearchURL}${config.searchFilters}${config.searchKeywords}`
);
