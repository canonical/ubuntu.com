import { resolve } from "@sentry/utils";
import { result } from "lodash";

export async function listAllAssessments() {
  let assessments = [];
  const response = await fetch(`/credentials/assessments/4229?page=1`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log(data);
  assessments = assessments.concat(data["assessments"]);
  let number_of_pages = data["meta"]["total_pages"];
  const promises = [];
  for (var page = 2; page <= number_of_pages; page++) {
    promises.push(
      new Promise((resolve) => {
        getAssesments(page, (result) => {
          resolve(result);
          assessments = assessments.concat(result);
          console.log("concating", assessments);
        });
      })
    );
  }
  await Promise.all(promises).then(() => {
    console.log("promises done", assessments);
  });
  return assessments;
}

async function getAssesments(page, callback) {
  let resp = await fetch(`/credentials/assessments/4229?page=` + page, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let resp_data = await resp.json();
  callback(resp_data["assessments"]);
}
