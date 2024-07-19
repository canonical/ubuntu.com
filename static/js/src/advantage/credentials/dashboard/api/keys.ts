export async function getUpcomingExams(page = 1) {
  const URL = `/credentials/dashboard/api/upcoming-exams?page=${page}`;
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
  let URL = `/credentials/dashboard/api/exam-results?page=${page}`;
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

export async function getSystemStatuses() {
  const URL = `/credentials/dashboard/api/system-statuses`;
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

export async function getIssuedBadgesCredly(
  filter: string | null = null,
  sort: string | null = null,
  page: number | null = null
) {
  let URL = `/credentials/dashboard/api/issued-badges`;
  const queryParams = new URLSearchParams();

  if (filter) {
    queryParams.append("filter", filter);
  }
  if (sort) {
    queryParams.append("sort", sort);
  }
  if (page) {
    queryParams.append("page", `${page}`);
  }

  if (queryParams.toString()) {
    URL += `?${queryParams.toString()}`;
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

export async function getTestTakerStats() {
  const URL = `/credentials/dashboard/api/test-taker-stats`;
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