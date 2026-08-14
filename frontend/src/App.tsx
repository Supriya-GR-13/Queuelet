import { useState } from "react";
import "./App.css";

type Campaign = {
  id: number;
  name: string;
  recipients: number;
  sent: number;
  status: "Scheduled" | "Running" | "Completed";
  date: string;
};

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Product Launch",
    recipients: 250,
    sent: 180,
    status: "Running",
    date: "Aug 14, 2026",
  },
  {
    id: 2,
    name: "Developer Outreach",
    recipients: 120,
    sent: 120,
    status: "Completed",
    date: "Aug 13, 2026",
  },
  {
    id: 3,
    name: "Hiring Campaign",
    recipients: 85,
    sent: 0,
    status: "Scheduled",
    date: "Aug 15, 2026",
  },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const [campaignName, setCampaignName] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const createCampaign = () => {
    if (!campaignName || !recipients || !subject || !message) {
      alert("Please fill all fields");
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now(),
      name: campaignName,
      recipients: Number(recipients),
      sent: 0,
      status: "Scheduled",
      date: scheduleDate || "Not scheduled",
    };

    setCampaigns([newCampaign, ...campaigns]);

    setCampaignName("");
    setRecipients("");
    setSubject("");
    setMessage("");
    setScheduleDate("");

    setPage("Campaigns");
  };

  const totalRecipients = campaigns.reduce(
    (sum, campaign) => sum + campaign.recipients,
    0
  );

  const totalSent = campaigns.reduce(
    (sum, campaign) => sum + campaign.sent,
    0
  );

  const completed = campaigns.filter(
    (campaign) => campaign.status === "Completed"
  ).length;

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-left">
          <div className="brand-large">
            <div className="logo">Q</div>
            <span>Queuelet</span>
          </div>

          <div className="login-content">
            <h1>
              Schedule smarter.
              <br />
              <span>Reach further.</span>
            </h1>

            <p>
              Automate your email outreach with Queuelet.
              Create campaigns, schedule emails and track
              everything from one simple dashboard.
            </p>

            <div className="feature-row">
              <div>✓ Smart scheduling</div>
              <div>✓ Campaign tracking</div>
              <div>✓ Email automation</div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="mobile-logo">
              <div className="logo">Q</div>
              <span>Queuelet</span>
            </div>

            <h2>Welcome to Queuelet</h2>
            <p className="login-subtitle">
              Sign in to manage your email campaigns
            </p>

            <button
              className="google-button"
              onClick={() => setLoggedIn(true)}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              className="demo-button"
              onClick={() => setLoggedIn(true)}
            >
              Continue as Demo User
            </button>

            <p className="terms">
              By continuing, you agree to Queuelet's Terms
              and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo">Q</div>
          <span>Queuelet</span>
        </div>

        <div className="nav-section">
          <p className="nav-title">MAIN</p>

          <button
            className={page === "Dashboard" ? "nav active" : "nav"}
            onClick={() => setPage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={page === "Campaigns" ? "nav active" : "nav"}
            onClick={() => setPage("Campaigns")}
          >
            <span>✉</span>
            Campaigns
          </button>

          <button
            className={page === "Create" ? "nav active" : "nav"}
            onClick={() => setPage("Create")}
          >
            <span>＋</span>
            Create Campaign
          </button>

          <button
            className={page === "Analytics" ? "nav active" : "nav"}
            onClick={() => setPage("Analytics")}
          >
            <span>◈</span>
            Analytics
          </button>
        </div>

        <div className="nav-section bottom-nav">
          <button className="nav">
            <span>⚙</span>
            Settings
          </button>

          <button
            className="nav"
            onClick={() => setLoggedIn(false)}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>
              {page === "Dashboard"
                ? "Here's what's happening with your campaigns."
                : page === "Campaigns"
                ? "Manage and monitor your email campaigns."
                : page === "Create"
                ? "Create and schedule a new email campaign."
                : "Track your email outreach performance."}
            </p>
          </div>

          <div className="user">
            <div className="avatar">S</div>
            <div>
              <strong>Supriya</strong>
              <small>Admin</small>
            </div>
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">✉</div>
                <div>
                  <p>Total Campaigns</p>
                  <h2>{campaigns.length}</h2>
                  <span className="positive">↑ 12% this month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">◉</div>
                <div>
                  <p>Emails Scheduled</p>
                  <h2>{totalRecipients}</h2>
                  <span className="positive">↑ 8% this month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <div>
                  <p>Emails Sent</p>
                  <h2>{totalSent}</h2>
                  <span className="positive">↑ 18% this month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">★</div>
                <div>
                  <p>Completed</p>
                  <h2>{completed}</h2>
                  <span className="positive">Campaigns</span>
                </div>
              </div>
            </div>

            <div className="section-header">
              <div>
                <h2>Recent Campaigns</h2>
                <p>Your latest email campaigns</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setPage("Create")}
              >
                + New Campaign
              </button>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>CAMPAIGN</th>
                    <th>RECIPIENTS</th>
                    <th>SENT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <strong>{campaign.name}</strong>
                      </td>
                      <td>{campaign.recipients}</td>
                      <td>{campaign.sent}</td>
                      <td>
                        <span
                          className={`status ${campaign.status.toLowerCase()}`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td>{campaign.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {page === "Campaigns" && (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <div className="campaign-card" key={campaign.id}>
                <div className="campaign-top">
                  <div className="campaign-icon">✉</div>

                  <span
                    className={`status ${campaign.status.toLowerCase()}`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <h3>{campaign.name}</h3>

                <div className="campaign-info">
                  <span>👥 {campaign.recipients} recipients</span>
                  <span>✓ {campaign.sent} sent</span>
                  <span>◷ {campaign.date}</span>
                </div>

                <div className="progress">
                  <div
                    style={{
                      width:
                        campaign.recipients === 0
                          ? "0%"
                          : `${Math.min(
                              (campaign.sent / campaign.recipients) * 100,
                              100
                            )}%`,
                    }}
                  />
                </div>

                <button className="view-button">
                  View Campaign →
                </button>
              </div>
            ))}
          </div>
        )}

        {page === "Create" && (
          <div className="form-card">
            <div className="form-header">
              <h2>Create New Campaign</h2>
              <p>Set up your email campaign and schedule it.</p>
            </div>

            <div className="form">
              <label>Campaign Name</label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Product Launch"
              />

              <label>Number of Recipients</label>
              <input
                type="number"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="e.g. 100"
              />

              <label>Email Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
              />

              <label>Email Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email message..."
                rows={7}
              />

              <label>Schedule Date</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />

              <div className="form-actions">
                <button
                  className="secondary-button"
                  onClick={() => setPage("Dashboard")}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={createCampaign}
                >
                  Schedule Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {page === "Analytics" && (
          <>
            <div className="analytics-cards">
              <div className="analytics-card">
                <p>Delivery Rate</p>
                <h2>96.4%</h2>
                <span>↑ 4.2%</span>
              </div>

              <div className="analytics-card">
                <p>Open Rate</p>
                <h2>68.7%</h2>
                <span>↑ 8.1%</span>
              </div>

              <div className="analytics-card">
                <p>Reply Rate</p>
                <h2>24.8%</h2>
                <span>↑ 3.6%</span>
              </div>

              <div className="analytics-card">
                <p>Failed Emails</p>
                <h2>3.6%</h2>
                <span className="warning">Needs attention</span>
              </div>
            </div>

            <div className="chart-card">
              <h2>Email Performance</h2>
              <p>Campaign performance over the last 7 days</p>

              <div className="fake-chart">
                <div style={{ height: "40%" }}>Mon</div>
                <div style={{ height: "55%" }}>Tue</div>
                <div style={{ height: "48%" }}>Wed</div>
                <div style={{ height: "72%" }}>Thu</div>
                <div style={{ height: "65%" }}>Fri</div>
                <div style={{ height: "85%" }}>Sat</div>
                <div style={{ height: "78%" }}>Sun</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;