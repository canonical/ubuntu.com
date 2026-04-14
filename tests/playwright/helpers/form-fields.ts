export const formTextFields = [
  { field: 'input[name="company"]', value: "Test Company" },
  { field: 'input[name="title"]', value: "Test Title" },
  { field: 'textarea[id="comments"]', value: "Test comments" },
  { field: 'input[name="firstName"]', value: "Test first name" },
  { field: 'input[name="lastName"]', value: "Test last name" },
  { field: 'input[name="email"]', value: "test@test.com" },
  {
    field: 'textarea[id="about-your-project"]',
    value: "Test project description",
  },
  { field: 'textarea[id="advice"]', value: "Test advice" },
];

export const formCheckboxFields = [
  { field: 'input[aria-labelledby="24-04"]' },
  { field: 'input[aria-labelledby="physical-server"]' },
  { field: 'input[aria-labelledby="ubuntu-repositories"]' },
  { field: 'input[aria-labelledby="pci"]' },
  { field: 'input[aria-labelledby="individual-developers"]' },
  { field: 'input[aria-labelledby="canonicalUpdatesOptIn"]' },
];

export const formRadioFields = [
  { field: 'input[aria-labelledby="less-5-machines"]' },
];

// Fields for the generated modal form, which renders inputs with aria-label
// instead of aria-labelledby
export const modalFormCheckboxFields = [
  { field: 'input[aria-label="24-04"]' },
  { field: 'input[aria-label="physical-server"]' },
  { field: 'input[aria-labelledby="canonicalUpdatesOptIn"]' },
];

export const modalFormRadioFields = [
  { field: 'input[aria-label="less-5-machines"]' },
];
