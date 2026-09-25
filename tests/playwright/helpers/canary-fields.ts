// Marketo auto-deletes leads with this email
export const CANARY_EMAIL = "marketocron24@canonical.com";

// Plain text only, see MARKETO_INJECTION_PATTERNS
export const canaryTextFields = [
  {
    field: 'textarea[id="about-your-project"]',
    value: "Automated hourly Marketo canary submission",
  },
  { field: 'textarea[id="advice"]', value: "No action needed" },
  { field: 'input[name="firstName"]', value: "Marketo" },
  { field: 'input[name="lastName"]', value: "Canary" },
  { field: 'input[name="email"]', value: CANARY_EMAIL },
  { field: 'input[name="company"]', value: "Canonical web canary" },
  { field: 'input[name="title"]', value: "Web team monitoring" },
];

export const canaryCheckboxFields = [
  { field: 'input[aria-label="24-04"]' },
  { field: 'input[aria-label="physical-server"]' },
  { field: 'input[aria-label="ubuntu-repositories"]' },
  { field: 'input[aria-label="pci"]' },
  { field: 'input[aria-label="individual-developers"]' },
];

export const canaryRadioFields = [
  { field: 'input[aria-label="less-5-machines"]' },
];

export const CANARY_COUNTRY = "GB";
// Posted as +44... by intl-tel-input
export const CANARY_PHONE = "2076302401";
