async function getPagesLength(page) {
  const pagesSelector = ".artdeco-pagination__pages"; // can add .children.length to get length of pages

  try {
    return await page.$eval(pagesSelector, (el) => el.children.length);
  } catch (error) {
    // console.log(error);
    return 1;
  }
}

async function getJobsLength(page) {
  const jobListSelector = ".scaffold-layout__list-container"; // can add .children.length to get length of jobs

  return await page.$eval(jobListSelector, (el) => el.children.length);
}

async function clickNextPage(page, nextPage) {
  try {
    await page.click(
      `li[data-test-pagination-page-btn='${nextPage}'] > button`
    );
    return true;
  } catch (error) {
    // console.log(error);
    return false;
  }
}

export { getPagesLength, getJobsLength, clickNextPage };
