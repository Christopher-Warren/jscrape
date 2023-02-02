export const config = {
  baseSearchURL: "https://www.linkedin.com/jobs/search/?",
  searchKeywords: "junior frontend developer", // The job to search for on linkedin
  timeRange: "1d",
  onSiteOrRemote: "remote",
  includeFilter: ["junior", "jr.", "intern", "react", "front end", "frontend"],
  excludeFilter: ["angular", ".net", "c#"],
  searchInterval: 0.1, // Time in minutes that the search will execute
};
