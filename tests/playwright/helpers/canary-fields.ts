// Marketo auto-deletes leads with this email
export const CANARY_EMAIL = "marketocron24@canonical.com";

export const CANARY_COUNTRY = "GB";
// Posted as +44... by intl-tel-input
export const CANARY_PHONE = "2076302401";

export const CANARY_OTHER_TEXT = "Canary other hardware";

// Plain text only, see MARKETO_INJECTION_PATTERNS
const contactFields = [
  { field: 'input[name="firstName"]', value: "Marketo" },
  { field: 'input[name="lastName"]', value: "Canary" },
  { field: 'input[name="email"]', value: CANARY_EMAIL },
  { field: 'input[name="company"]', value: "Canonical web canary" },
  { field: 'input[name="title"]', value: "Web team monitoring" },
];

export interface CanaryForm {
  path: string;
  formId: string;
  // Omit for forms rendered inline on the page
  modalId?: string;
  textFields: { field: string; value: string }[];
  choiceFields: string[];
  // "Other" radio/checkbox that reveals a textarea
  otherField?: { field: string; textarea: string };
}

// Shared by the "default-contact-us-devices" generated forms
const devicesForm = {
  textFields: [
    {
      field: 'textarea[id="about-your-project"]',
      value: "Automated hourly Marketo canary submission",
    },
    { field: 'textarea[id="advice"]', value: "No action needed" },
    ...contactFields,
  ],
  choiceFields: [
    'input[aria-label="24-04"]',
    'input[aria-label="physical-server"]',
    'input[aria-label="ubuntu-repositories"]',
    'input[aria-label="pci"]',
    'input[aria-label="individual-developers"]',
    'input[aria-label="less-5-machines"]',
  ],
};

export const canaryForms: CanaryForm[] = [
  {
    path: "/pricing/pro",
    formId: "1240",
    modalId: "pricing-contact-modal",
    ...devicesForm,
  },
  { path: "/kubernetes/contact-us", formId: "3230", ...devicesForm },
  {
    path: "/embedded",
    formId: "1266",
    modalId: "embedded-modal",
    textFields: [
      {
        field: 'textarea[id="any-other-comments"]',
        value: "Automated hourly Marketo canary submission",
      },
      ...contactFields,
    ],
    choiceFields: [
      'input[aria-label="yes"]',
      'input[aria-label="no-timeline"]',
      'input[aria-label="0-100-units"]',
      'input[aria-label="which-products-are-you-most-interested-in-training"]',
    ],
    otherField: {
      field: 'input[aria-label="other"]',
      textarea: "textarea#other-textarea",
    },
  },
];
