import { useEffect, useState } from "react";
import type { CampaignDetail as CampaignDetailData, CampaignStatus } from "../types";
import { fetchCampaignDetail, updateCampaignStatus, deleteCampaign } from "../api/campaigns";
import StatusBadge from "../components/StatusBadge";

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
  onDeleted: () => void;
}

const STATUS_OPTIONS: CampaignStatus[] = ["draft", "active", "paused", "completed"];

function CampaignDetail({ campaignId, onBack, onDeleted }: CampaignDetailProps) {
  const [data, setData] = useState<CampaignDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCampaignDetail(campaignId)
      .then(setData)
      .catch(() => setError("Failed to load campaign details."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [campaignId]);

  const handleStatusChange = async (status: CampaignStatus) => {
    setUpdating(true);
    try {
      await updateCampaignStatus(campaignId, status);
      load();
    } catch {
      setError("Failed to update campaign status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this campaign and all its scheduled emails?")) return;
    await deleteCampaign(campaignId);
    onDeleted();
  };

  if (loading) {
    return <p style={{ color: "#8991a1" }}>Loading campaign…</p>;
  }

  if (error || !data) {
    return <p style={{ color: "#d64545" }}>{error || "Campaign not found."}</p>;
  }

  const { campaign, statistics, jobs } = data;

  return (
    <>
      <button className="secondary-button" style={{ marginBottom: 20 }} onClick={onBack}>
        ← Back to Campaigns
      </button>

      <div className="section-header">
        <div>
          <h2>{campaign.name}</h2>
          <p>
            Created {new Date(campaign.created_at).toLocaleString()} ·{" "}
            <StatusBadge status={campaign.status} />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {STATUS_OPTIONS.filter((s) => s !== campaign.status).map((status) => (
            <button
              key={status}
              className="secondary-button"
              disabled={updating}
              onClick={() => handleStatusChange(status)}
            >
              Mark {status}
            </button>
          ))}
          <button className="secondary-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="stats" style={{ marginBottom: 30 }}>
        <div className="stat-card">
          <div className="stat-icon blue">Σ</div>
          <div>
            <p>Total Emails</p>
            <h2>{statistics.total}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">◷</div>
          <div>
            <p>Pending</p>
            <h2>{statistics.pending}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✓</div>
          <div>
            <p>Sent</p>
            <h2>{statistics.sent}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">✕</div>
          <div>
            <p>Failed</p>
            <h2>{statistics.failed}</h2>
          </div>
        </div>
      </div>

      <div className="table-card">
        {jobs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#8991a1" }}>
            No emails have been added to this campaign yet.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>RECIPIENT</th>
                <th>SUBJECT</th>
                <th>STATUS</th>
                <th>SCHEDULED FOR</th>
                <th>SENT AT</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.recipient_email}</td>
                  <td>{job.subject}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td>{new Date(job.scheduled_at).toLocaleString()}</td>
                  <td>{job.sent_at ? new Date(job.sent_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default CampaignDetail;
