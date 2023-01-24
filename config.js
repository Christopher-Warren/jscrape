export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/",
  searchFilters: "?f_TPR=r604800&f_WT=2&keywords=",
  searchKeywords: "junior frontend developer",
  customFilters: ["frontend developer"],
  mainURL: null,
};
config.mainURL = encodeURI(
  `${config.baseSearchURL}${config.searchFilters}${config.searchKeywords}`
);
console.log(
  `${config.baseSearchURL}${config.searchFilters}${config.searchKeywords}`
);
