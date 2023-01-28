export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/",
  searchFilters: "?f_TPR=r604800&f_WT=2&keywords=",
  searchKeywords: "junior frontend developer",
  customFilters: [
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
};
config.mainURL = encodeURI(
  `${config.baseSearchURL}${config.searchFilters}${config.searchKeywords}`
);
