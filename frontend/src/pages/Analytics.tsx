import type { Campaign } from "../types";

interface AnalyticsProps {
  campaigns: Campaign[];
}

function Analytics({ campaigns }: AnalyticsProps) {
  const totals = campaigns.reduce(
    (acc, c) => {
      acc.total += c.total_jobs;
      acc.sent += c.sent_jobs;
      acc.pending += c.pending_jobs;
      acc.failed += c.failed_jobs;
      return acc;
    },
    { total: 0, sent: 0, pending: 0, failed: 0 }
  );

  const deliveryRate = totals.total === 0 ? 0 : (totals.sent / totals.total) * 100;
  const failureRate = totals.total === 0 ? 0 : (totals.failed / totals.total) * 100;
  const pendingRate = totals.total === 0 ? 0 : (totals.pending / totals.total) * 100;

  const maxBar = Math.max(totals.sent, totals.pending, totals.failed, 1);

  return (
    <>
      <div className="analytics-cards">
        <div className="analytics-card">
          <p>Delivery Rate</p>
          <h2>{deliveryRate.toFixed(1)}%</h2>
          <span>{totals.sent} of {totals.total} emails sent</span>
        </div>

        <div className="analytics-card">
          <p>Pending</p>
          <h2>{pendingRate.toFixed(1)}%</h2>
          <span>{totals.pending} emails queued</span>
        </div>

        <div className="analytics-card">
          <p>Total Campaigns</p>
          <h2>{campaigns.length}</h2>
          <span>{campaigns.filter((c) => c.status === "active").length} currently active</span>
        </div>

        <div className="analytics-card">
          <p>Failed Emails</p>
          <h2>{failureRate.toFixed(1)}%</h2>
          <span className={failureRate > 5 ? "warning" : ""}>
            {failureRate > 5 ? "Needs attention" : `${totals.failed} failed`}
          </span>
        </div>
      </div>

      <div className="chart-card">
        <h2>Email Outcomes</h2>
        <p>Sent vs. pending vs. failed, across all campaigns</p>

        <div className="fake-chart">
          <div style={{ height: `${(totals.sent / maxBar) * 100}%` }} title={`Sent: ${totals.sent}`}>
            Sent
          </div>
          <div style={{ height: `${(totals.pending / maxBar) * 100}%` }} title={`Pending: ${totals.pending}`}>
            Pending
          </div>
          <div style={{ height: `${(totals.failed / maxBar) * 100}%` }} title={`Failed: ${totals.failed}`}>
            Failed
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;
