// API Integration Layer for Cookie Policy Session Management

let API_BASE_URL;

// Set the base URL for the API service
export const initApi = (apiUrl) => {
  if (apiUrl) {
    API_BASE_URL = apiUrl;
  }
};

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
export const redirectToSession = ({ manageConsent, legacyUserId }) => {
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

// Health check for the central service
export const checkServiceHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1-second timeout

    const response = await fetch(buildApiUrl("/health"), {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    console.error("Cookie service health check failed:", error);
    return false;
  }
};
