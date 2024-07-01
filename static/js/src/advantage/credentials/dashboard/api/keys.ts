export async function getUpcomingExams(page = 1) {
  const URL = `/credentials/dashboard/upcoming-exams?page=${page}`;
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
}

export async function getExamResults(page = 1, state: string | null = "") {
  let URL = `/credentials/dashboard/exam-results?page=${page}`;
  if (state) {
    URL += `&state=${state}`;
  }
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
}
