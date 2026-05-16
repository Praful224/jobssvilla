export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type Job = {
  id: number;
  company: string;
  role: string;
  location: string;
  salary?: string | null;
  skills?: string | null;
  apply_link: string;
  description?: string | null;
};

export type Profile = {
  id?: number;
  user_id?: number;
  name?: string;
  email?: string;
  full_name?: string | null;
  title?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  skills?: string | null;
  experience?: string | null;
  education?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  resume_url?: string | null;
};

export type Application = {
  id: number;
  job_id?: number | null;
  company: string;
  role: string;
  location?: string | null;
  status: string;
  source: string;
  notes?: string | null;
  applied_at?: string;
  updated_at?: string;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  channel: string;
  is_read: boolean;
  created_at: string;
};

export type AnalyticsSummary = {
  total_jobs: number;
  applications: number;
  saved_jobs: number;
  unread_notifications: number;
  application_status: Record<string, number>;
};

export type Company = {
  id: number;
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  description?: string | null;
  logo_url?: string | null;
};

export type Mentor = {
  id: number;
  name: string;
  title: string;
  company?: string | null;
  skills?: string | null;
  hourly_rate?: string | null;
  availability?: string | null;
  bio?: string | null;
};

export type Post = {
  id: number;
  title: string;
  body: string;
  tags?: string | null;
  created_at: string;
};

export type ResumeAnalysis = {
  ats_score: number;
  keyword_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
};

export type ResumeRecord = {
  id?: number;
  file_name?: string | null;
  content?: string | null;
  skills?: string | null;
  ats_score?: number;
  keyword_score?: number;
  suggestions?: string | null;
};

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string" ? data.detail : "Request failed";
    throw new Error(detail);
  }

  return data as T;
}

export function jsonHeaders() {
  return {
    "Content-Type": "application/json",
  };
}
