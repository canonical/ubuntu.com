import { UserBan } from "../utils/types";

export async function getUpcomingExams(page = 1, onSuccess: any) {
  try {
    const URL = `/credentials/api/upcoming-exams?page=${page}&state[]=scheduled&state[]=created&sort=-id`;
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      onSuccess(data, page);
    }
    return data;
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getExamResults(
  page = 1,
  state: string | null = "",
  onSuccess: any,
) {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getSystemStatuses() {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getIssuedBadgesCredly(
  filter: string | null = null,
  sort: string | null = null,
  page: number | null = null,
  onSuccess: any,
) {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getIssuedBadgesBulkCredly(filter: string | null = null) {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getTestTakerStats() {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function issueCredlyBadge(badgeData: any) {
  try {
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
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getUserPermissions() {
  try {
    const URL = `/credentials/api/user-permissions`;
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function cancelScheduledExam(reservationId: string) {
  try {
    const URL = `/credentials/api/cancel-scheduled-exam/${reservationId}`;
    const response = await fetch(URL, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw new Error(error as string);
  }
}

export async function getUserBans() {
  try {
    return {
      banned_users: [
        {
          bannedBy: "admin@canonical.com",
          blocked: true,
          email: "jackie@canonical.com",
          expiresAt: "2025-04-24T04:25:43.511+05:00",
          reason: "This is a very long reason for banning a user. This is a very long reason for banning a user. This is a very long reason for banning a user. This is a very long reason for banning a user.",
          timestamp: "2025-02-06T23:31:00+05:00",
        },
        {
          bannedBy: "admin@canonical.com",
          blocked: true,
          email: "charlie@canonical.com",
          expiresAt: "2026-01-01T14:25:43.511+00:00",
          reason: "This is a very long reason for banning a user. This is a very long reason for banning a user. This is a very long reason for banning a user. This is a very long reason for banning a user.",
          timestamp: "2025-02-06T23:31:00+05:00",
        },
      ],
    };
    const URL = `/credentials/api/user-bans`;
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw new Error(error as string);
  }
}


export async function ensureCUEUserBan(userBan: UserBan) {
  try {
    const URL = `/credentials/api/user-ban`;
    const response = await fetch(URL, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userBan),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw new Error(error as string);
  }
}