import type { Campaign } from "../types";
import StatusBadge from "../components/StatusBadge";

interface CampaignsProps {
  campaigns: Campaign[];
  onView: (id: string) => void;
}

function Campaigns({ campaigns, onView }: CampaignsProps) {
  if (campaigns.length === 0) {
    return (
      <div className="table-card" style={{ padding: 40, textAlign: "center", color: "#8991a1" }}>
        No campaigns yet. Head to "Create Campaign" to schedule your first one.
      </div>
    );
  }

  return (
    <div className="campaign-grid">
      {campaigns.map((campaign) => (
        <div className="campaign-card" key={campaign.id}>
          <div className="campaign-top">
            <div className="campaign-icon">✉</div>
            <StatusBadge status={campaign.status} />
          </div>

          <h3>{campaign.name}</h3>

          <div className="campaign-info">
            <span>👥 {campaign.total_jobs} recipients</span>
            <span>✓ {campaign.sent_jobs} sent</span>
            <span>◷ {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>

          <div className="progress">
            <div
              style={{
                width:
                  campaign.total_jobs === 0
                    ? "0%"
                    : `${Math.min((campaign.sent_jobs / campaign.total_jobs) * 100, 100)}%`,
              }}
            />
          </div>

          <button className="view-button" onClick={() => onView(campaign.id)}>
            View Campaign →
          </button>
        </div>
      ))}
    </div>
  );
}

export default Campaigns;
