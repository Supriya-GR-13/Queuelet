import { useState } from "react";
import type { Page } from "../types";
import { createCampaign, addCampaignJobs, updateCampaignStatus } from "../api/campaigns";

interface CreateCampaignProps {
  userId: string;
  onNavigate: (page: Page) => void;
  onCreated: () => void;
}

function parseRecipients(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

function CreateCampaign({ userId, onNavigate, onCreated }: CreateCampaignProps) {
  const [campaignName, setCampaignName] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCampaignName("");
    setRecipients("");
    setSubject("");
    setMessage("");
    setScheduleDate("");
  };

  const submit = async (activate: boolean) => {
    setError(null);

    const recipientList = parseRecipients(recipients);

    if (!campaignName || recipientList.length === 0 || !subject || !message || !scheduleDate) {
      setError("Please fill in all fields, including at least one recipient.");
      return;
    }

    setSubmitting(true);
    try {
      const campaign = await createCampaign(userId, campaignName);

      await addCampaignJobs(campaign.id, {
        recipients: recipientList,
        subject,
        body: message,
        scheduledAt: new Date(scheduleDate).toISOString(),
      });

      if (activate) {
        await updateCampaignStatus(campaign.id, "active");
      }

      resetForm();
      onCreated();
      onNavigate("Campaigns");
    } catch (err) {
      console.error(err);
      setError("Failed to create campaign. Please check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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

        <label>Recipients (comma or newline separated)</label>
        <textarea
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder={"alice@example.com\nbob@example.com"}
          rows={4}
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

        {error && (
          <p style={{ color: "#d64545", fontSize: 13, marginTop: 16 }}>{error}</p>
        )}

        <div className="form-actions">
          <button className="secondary-button" onClick={() => onNavigate("Dashboard")}>
            Cancel
          </button>

          <button
            className="secondary-button"
            disabled={submitting}
            onClick={() => submit(false)}
          >
            Save as Draft
          </button>

          <button
            className="primary-button"
            disabled={submitting}
            onClick={() => submit(true)}
          >
            {submitting ? "Scheduling…" : "Schedule & Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaign;
