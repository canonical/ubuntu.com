// API Integration Layer for Cookie Policy Session Management

const API_BASE_URL = "http://localhost:8118"; // Change to https://cookies.canonical.com in production

// Build API URL with query parameters
export const buildApiUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, API_BASE_URL);
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Handle API errors
export const handleApiError = (error, context = "") => {
  console.error(`Cookie Policy API Error ${context}:`, error);
  return {
    success: false,
    error: error.message || "Unknown error occurred",
  };
};

// GET request to retrieve user consent preferences
export const getConsentPreferences = async (code, userUuid) => {
  try {
    const url = buildApiUrl("/consent", { code, user_uuid: userUuid });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleApiError(error, "getConsentPreferences");
  }
};

// POST request to save user consent preferences
export const postConsentPreferences = async (code, userUuid, preferences) => {
  try {
    const url = buildApiUrl("/consent", { code, user_uuid: userUuid });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleApiError(error, "postConsentPreferences");
  }
};

// Redirect to session endpoint
export const redirectToSession = ({manageConsent, legacyUserId}) => {
  const params = { return_url: window.location.href };

  if (manageConsent) {
    params.action = "manage-cookies";
  }

  if (legacyUserId) {
    params.previous_uuid = legacyUserId;
  }

  const sessionUrl = buildApiUrl("/cookies/session", params);
  window.location.href = sessionUrl;
};
