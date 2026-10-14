import fetch from "jest-fetch-mock";
import { fetchUserOrganization } from "./cancon";

describe("cancon", () => {
  afterEach(() => {
    fetch.resetMocks();
  });

  it("returns the organization from the user-organization response", async () => {
    const organization = {
      id: "org-1",
      name: "Canonical",
      version: 3,
      address: {
        city: "London",
        country: "GB",
        addressLine1: "5 Blue Fin Building",
        postalCode: "SE1 0SU",
      },
      vatCode: "GB123",
    };
    fetch.mockResponseOnce(JSON.stringify({ organization }));

    await expect(fetchUserOrganization()).resolves.toEqual(organization);
    expect(fetch).toHaveBeenCalledWith(
      "/portal-proxy/api/organization/user-organization",
    );
  });

  it("rejects unsuccessful user-organization responses", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ error: "Organization not found" }),
      {
        status: 404,
      },
    );

    await expect(fetchUserOrganization()).rejects.toThrow(
      "Unable to load organization",
    );
  });
});
