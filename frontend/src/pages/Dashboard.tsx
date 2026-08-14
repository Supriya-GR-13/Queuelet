import type { Campaign, Page } from "../types";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

interface DashboardProps {
  campaigns: Campaign[];
  onNavigate: (page: Page) => void;
}

function Dashboard({ campaigns, onNavigate }: DashboardProps) {
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.total_jobs, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent_jobs, 0);
  const completed = campaigns.filter((c) => c.status === "completed").length;

  return (
    <>
      <div className="stats">
        <StatCard icon="✉" color="blue" label="Total Campaigns" value={campaigns.length} />
        <StatCard icon="◉" color="purple" label="Emails Scheduled" value={totalRecipients} />
        <StatCard icon="✓" color="green" label="Emails Sent" value={totalSent} />
        <StatCard icon="★" color="orange" label="Completed" value={completed} hint="Campaigns" />
      </div>

      <div className="section-header">
        <div>
          <h2>Recent Campaigns</h2>
          <p>Your latest email campaigns</p>
        </div>

        <button className="primary-button" onClick={() => onNavigate("Create")}>
          + New Campaign
        </button>
      </div>

      <div className="table-card">
        {campaigns.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#8991a1" }}>
            No campaigns yet. Create your first one to get started.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>CAMPAIGN</th>
                <th>RECIPIENTS</th>
                <th>SENT</th>
                <th>STATUS</th>
                <th>CREATED</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <strong>{campaign.name}</strong>
                  </td>
                  <td>{campaign.total_jobs}</td>
                  <td>{campaign.sent_jobs}</td>
                  <td>
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Dashboard;
