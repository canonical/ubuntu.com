export const getTestURL = (URL) => `${URL}?test_backend=true`;
export const getRandomEmail = () =>
  `cypress-test-${Math.random().toString(36).substr(2, 10)}@canonical.com`;

  export const standardFormUrls = [
    "/openstack/contact-us",
    "/appliance/contact-us",
    "/ai/contact-us",
    "/containers/contact-us",
    "/download/contact-us",
    "/financial-services/contact-us",
    "/gov/contact-us",
    "/kubernetes/contact-us",
    "/managed/contact-us",
    "/security/contact-us",
    "/server/contact-us",
    "/support/contact-us",
    "/training/contact-us",
    "/wsl/contact-us",
    "/aws/contact-us",
    "/azure/contact-us",
    "/ceph/contact-us",
    "/core/contact-us",
    "/core/smartstart/contact-us",
    "/dell/contact-us",
    "/desktop/contact-us",
    "/gcp/contact-us",
    "/ibm/contact-us",
    "/internet-of-things/contact-us",
    "/masters-conference/contact-us",
    "/observability/contact-us",
    "/telco/osm/contact-us",
  ];