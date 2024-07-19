export type CredlyMetadata = {
  count: number;
  current_page: number;
  total_count: number;
  total_pages: number;
  per: number;
  previous_page_url: string | null;
  next_page_url: string | null;
};

export type CredlyBadge = {
  id: number;
  badge_template: {
    name: string;
  };
  issued_to: string;
  recipient_email: string;
};

export type Assessment = {
  id: number;
  address: {
    country_code: string;
  }
};
