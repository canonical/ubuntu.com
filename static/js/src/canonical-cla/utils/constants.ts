export const AgreementTypes = ["individual", "organization"] as const;

export type AgreementType = (typeof AgreementTypes)[number];

export type IndividualSignForm = {
  agreement_type: "individual";
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  country: string;
  github_email?: string;
  launchpad_email?: string;
};

export type OrganizationSignForm = {
  agreement_type: "organization";
  name: string;
  contact_name: string;
  contact_email: string;
  phone_number: string;
  address: string;
  country: string;
  email_domain: string;
};
