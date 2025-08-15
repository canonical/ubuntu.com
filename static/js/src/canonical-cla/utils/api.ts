import { IndividualSignForm, OrganizationSignForm } from "./constants";

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

type Split<
  S extends string,
  D extends string,
> = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

type Api = {
  "get:/github/login": {
    request: {
      redirect_url: string;
    };
    response: {};
  };
  "get:/github/logout": {
    request: {
      redirect_url: string;
    };
    response: {};
  };
  "get:/github/profile": {
    response: {
      id: number;
      username: string;
      emails: string[];
    };
  };

  "get:/launchpad/login": {
    request: {
      redirect_url: string;
    };
    response: {};
  };
  "get:/launchpad/logout": {
    request: {
      redirect_url: string;
    };
    response: {};
  };
  "get:/launchpad/profile": {
    response: {
      id: number;
      username: string;
      emails: string[];
    };
  };

  "post:/cla/individual/sign": {
    request: IndividualSignForm;
    response: {
      message: string;
    };
  };

  "post:/cla/organization/sign": {
    request: OrganizationSignForm;
    response: {
      message: string;
    };
  };
};

type HttpMethod = Split<keyof Api, ":">[0];
type EndpointForMethod<M extends HttpMethod> =
  Extract<keyof Api, `${Lowercase<M>}:${string}`> extends `${string}:${infer E}`
    ? E
    : never;
type ApiValue<M extends HttpMethod, E extends EndpointForMethod<M>> = {
  [K in keyof Api]: K extends `${Lowercase<M>}:${E}` ? Api[K] : never;
}[keyof Api];

type ApiResponse<
  M extends HttpMethod,
  E extends EndpointForMethod<M>,
> = ApiValue<M, E>["response"];
type ApiRequest<M extends HttpMethod, E extends EndpointForMethod<M>> =
  ApiValue<M, E> extends { request: any }
    ? ApiValue<M, E>["request"]
    : undefined;

const request = async <M extends HttpMethod, E extends EndpointForMethod<M>>(
  method: M,
  endpoint: E,
  request: ApiRequest<M, E> = undefined,
): Promise<ApiResponse<M, E>> => {
  let requestUrl: string = endpoint;
  if (method === "get" && request) {
    const params = new URLSearchParams();
    Object.entries(request).forEach(([key, value]) => {
      params.append(key, value);
    });
    requestUrl = `${endpoint}?${params.toString()}`;
  }
  const encodedRequestUrl = btoa(requestUrl);
  const url = `https://canonical.com/legal/contributors/agreement/api?request_url=${encodedRequestUrl}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: method !== "get" ? JSON.stringify(request) : undefined,
  });
  const responseContent = await response.text();
  try {
    const responseData = JSON.parse(responseContent);
    if (!response.ok) {
      const message =
        response.status === 422
          ? responseData.detail.map((e: { msg: string }) => e.msg).join(", ")
          : responseData.detail;
      throw new ApiError(message);
    }
    return responseData;
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw new ApiError(responseContent);
  }
};

export const getGithubProfile = async () => {
  try {
    return await request("get", "/github/profile");
  } catch (e) {
    // ignore unauthorized error
    return null;
  }
};

export const postIndividualSignForm = async (
  form: IndividualSignForm,
): Promise<{ message: string }> => {
  return await request("post", "/cla/individual/sign", form);
};

export const postOrganizationSignForm = async (
  form: OrganizationSignForm,
): Promise<{ message: string }> => {
  return await request("post", "/cla/organization/sign", form);
};

export const loginWithGithub = () => {
  const url = new URL("/github/login", window.CANONICAL_CLA_API_URL);
  // https://canonical.com/legal/contributors/agreement/api/github/login?agreement_url=base64(window.location.href)
  const redirectUrl = new URL(
    "https://canonical.com/legal/contributors/agreement/api/github/login",
    window.location.origin,
  );
  redirectUrl.searchParams.append("agreement_url", btoa(window.location.href));

  url.searchParams.append("redirect_url", btoa(redirectUrl.toString()));
  return url.toString();
};

export const logoutFromGithub = () => {
  const url = new URL("/github/logout", window.CANONICAL_CLA_API_URL);
  // https://canonical.com/legal/contributors/agreement/api/github/logout?agreement_url=base64(window.location.href)
  const redirectUrl = new URL(
    "https://canonical.com/legal/contributors/agreement/api/github/logout",
    window.location.origin,
  );
  redirectUrl.searchParams.append("agreement_url", btoa(window.location.href));

  url.searchParams.append("redirect_url", btoa(redirectUrl.toString()));
  return url.toString();
};

export const getLaunchpadProfile = async () => {
  try {
    return await request("get", "/launchpad/profile");
  } catch (e) {
    // ignore unauthorized error
    return null;
  }
};

export const loginWithLaunchpad = () => {
  const url = new URL("/launchpad/login", window.CANONICAL_CLA_API_URL);
  // https://canonical.com/legal/contributors/agreement/api/launchpad/login?agreement_url=base64(window.location.href)
  const redirectUrl = new URL(
    "https://canonical.com/legal/contributors/agreement/api/launchpad/login",
    window.location.origin,
  );
  redirectUrl.searchParams.append("agreement_url", btoa(window.location.href));

  url.searchParams.append("redirect_url", btoa(redirectUrl.toString()));
  return url.toString();
};

export const logoutFromLaunchpad = () => {
  const url = new URL("/launchpad/logout", window.CANONICAL_CLA_API_URL);

  // https://canonical.com/legal/contributors/agreement/api/launchpad/logout?agreement_url=base64(window.location.href)
  const redirectUrl = new URL(
    "https://canonical.com/legal/contributors/agreement/api/launchpad/logout",
    window.location.origin,
  );
  redirectUrl.searchParams.append("agreement_url", btoa(window.location.href));

  url.searchParams.append("redirect_url", btoa(redirectUrl.toString()));
  return url.toString();
};
