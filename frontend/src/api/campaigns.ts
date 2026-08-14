import apiClient from "./client";
import type { Campaign, CampaignDetail, CampaignStatus } from "../types";

export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  const response = await apiClient.get<{ campaigns: Campaign[] }>("/campaigns", {
    params: { userId },
  });
  return response.data.campaigns;
}

export async function fetchCampaignDetail(id: string): Promise<CampaignDetail> {
  const response = await apiClient.get<CampaignDetail>(`/campaigns/${id}`);
  return response.data;
}

export async function createCampaign(userId: string, name: string): Promise<Campaign> {
  const response = await apiClient.post<{ campaign: Campaign }>("/campaigns", {
    userId,
    name,
  });
  return response.data.campaign;
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<Campaign> {
  const response = await apiClient.patch<{ campaign: Campaign }>(
    `/campaigns/${id}/status`,
    { status }
  );
  return response.data.campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiClient.delete(`/campaigns/${id}`);
}

export interface AddCampaignJobsInput {
  recipients: string[];
  subject: string;
  body: string;
  scheduledAt: string;
}

export async function addCampaignJobs(
  campaignId: string,
  input: AddCampaignJobsInput
): Promise<number> {
  const response = await apiClient.post<{ count: number }>(
    `/campaigns/${campaignId}/jobs`,
    input
  );
  return response.data.count;
}
