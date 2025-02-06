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
  id: string;
  badge_template: {
    id: string;
    name: string;
    image_url: string;
  };
  issued_to: string;
  recipient_email: string;
  state: string;
  issuer_earner_id: string | null;
};

export type Address = {
  country_code: string;
};

export type AssessmentReservationTA = {
  id: number;
  uuid: string;
  ability_screen: {
    id: number;
    name: string;
  };
  assessment: {
    id: number;
    state: string;
  };
  starts_at: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  state: string;
};

export type AssessmentReservationMeta = {
  total_pages: number;
  current_page: number;
  total_count: number;
};

export type ExamResultsTA = {
  id: number;
  user_email: string;
  state: string;
  completed_at: string;
  score: number;
  duration_in_minutes: number;
  uuid: string;
  ability_screen: {
    id: number;
    cutoff_score: number;
    display_name: string;
    name: string;
  };
  result_url: string;
  user: {
    first_name: string;
    last_name: string;
    full_name: string;
  };
};

export type ExamResultsMeta = {
  current_page: number;
  next_page: number;
  prev_page: number;
  total_count: number;
  total_pages: number;
};

export type CredlyBadgeIssueBody = {
  recipient_email: string;
  issued_to_first_name: string;
  issued_to_last_name: string;
  badge_template_id: string;
};

export type UserBan = {
  email: string;
  bannedBy: string;
  expiresAt?: string;
  timestamp: string;
  reason: string;
  blocked: boolean;
};