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

export const interactiveForms = [
  {
    url: "/",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/16-04/azure",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
    ],
    submitBtn: /Let's discuss/,
  },
  // {
  //   url: "/advantage",
  //   inputs: [
  //     [/First name/, "test"],
  //     [/Last name/, "test"],
  //     [/Work email/, "test@gmail.com"],
  //   ],
  //   submitBtn: /Let's discuss/,
  // },
  // {
  //   url: "/ai/services",
  //   inputs: [
  //     [/First name/, "test"],
  //     [/Last name/, "test"],
  //     [/Work email/, "test@gmail.com"],
  //     [/Mobile\/cell phone number:/, "07777777777"],
  //   ],
  //   submitBtn: /Let's discuss/,
  // },
  // {
  //   url: "/appliance/hardware",
  //   inputs: [
  //     [/First name/, "test"],
  //     [/Last name/, "test"],
  //     [/Work email/, "test@gmail.com"],
  //   ],
  //   submitBtn: /Let's discuss/,
  // },
//   {
//     url: "/automotive",
//     inputs: [
//       [/First name/, "test"],
//       [/Last name/, "test"],
//       [/Company/, "test"],
//       [/Email address/, "test@gmail.com"],
//       [/Mobile\/cell phone number:/, "07777777777"],
//     ],
//     submitBtn: /Let's discuss/,
//   },
  {
    url: "/aws",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/azure",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/ceph",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/containers",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/core",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/core/smartstart",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/dell",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/desktop/organisations",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/internet-of-things/digital-signage",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/download/iot",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/financial-services",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/gcp",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/gov",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Work phone:/, "07777777777"],
    ],
    submitBtn: /Let's talk/,
  },
  {
    url: "/ibm",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/internet-of-things/appstore",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/internet-of-things/gateways",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/internet-of-things/networking",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company:/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/kubernetes",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/kubernetes/managed",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/managed",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/managed/apps",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/observability",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/openstack",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/openstack/managed",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/openstack/pricing-calculator",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company name/, "test"],
      [/Job title/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/pricing/consulting",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/pricing/devices",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/pricing/infra",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/robotics",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company/, "test"],
      [/Job title/, "test"],
      [/Email address:/, "test@gmail.com"],
      [/Phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/security",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/security/docker-images",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/security/esm",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/server",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/telco",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/telco/osm",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
  {
    url: "/wsl",
    inputs: [
      [/First name/, "test"],
      [/Last name/, "test"],
      [/Company name/, "test"],
      [/Work email/, "test@gmail.com"],
      [/Mobile\/cell phone number:/, "07777777777"],
    ],
    submitBtn: /Let's discuss/,
  },
];
