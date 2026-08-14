export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  status: CampaignStatus;
  created_at: string;
  total_jobs: number;
  sent_jobs: number;
  pending_jobs: number;
  failed_jobs: number;
}

export type EmailJobStatus = "pending" | "sent" | "failed";

export interface EmailJob {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: EmailJobStatus;
  scheduled_at: string;
  sent_at: string | null;
}

export interface CampaignStatistics {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

export interface CampaignDetail {
  campaign: Campaign;
  statistics: CampaignStatistics;
  jobs: EmailJob[];
}

export type Page = "Dashboard" | "Campaigns" | "Create" | "Analytics" | "Detail";
