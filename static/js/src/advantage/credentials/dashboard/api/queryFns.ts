export async function getUpcomingExams(page = 1, onSuccess: any) {
  const URL = `/credentials/api/upcoming-exams?page=${page}`;
  const response = await fetch(URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (response.ok) {
    onSuccess(data);
  }
  return data;
}

export async function getExamResults(
  page = 1,
  state: string | null = "",
  onSuccess: any
) {
  let URL = `/credentials/api/exam-results?page=${page}&ability_screen_id[]=4229`;
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
  if (response.ok) {
    onSuccess(data);
  }
  return data;
}

export async function getSystemStatuses() {
  const URL = `/credentials/api/system-statuses`;
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
  page: number | null = null,
  onSuccess: any
) {
  let URL = `/credentials/api/issued-badges`;
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
  if (response.ok) {
    onSuccess(data);
  }
  return data;
}

export async function getIssuedBadgesBulkCredly(filter: string | null = null) {
  let URL = `/credentials/api/issued-badges-bulk`;
  const queryParams = new URLSearchParams();

  if (filter) {
    queryParams.append("filter", filter);
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
  const URL = `/credentials/api/test-taker-stats`;
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

export async function issueCredlyBadge(badgeData: any) {
  const URL = `/credentials/api/issue-credly-badge`;
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(badgeData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}
