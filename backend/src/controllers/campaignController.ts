import { Request, Response } from "express";
import pool from "../config/database";
import { emailQueue } from "../queues/emailQueue";

// Create a campaign
export const createCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, name } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        message: "userId and name are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO campaigns
       (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, name]
    );

    return res.status(201).json({
      message: "Campaign created successfully",
      campaign: result.rows[0]
    });

  } catch (error) {
    console.error("Create campaign error:", error);

    return res.status(500).json({
      message: "Failed to create campaign"
    });
  }
};


// Get all campaigns
export const getCampaigns = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM campaigns
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      campaigns: result.rows
    });

  } catch (error) {
    console.error("Get campaigns error:", error);

    return res.status(500).json({
      message: "Failed to fetch campaigns"
    });
  }
};


// Get campaign with email jobs and statistics
export const getCampaignById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const campaignResult = await pool.query(
      `SELECT *
       FROM campaigns
       WHERE id = $1`,
      [id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    const jobsResult = await pool.query(
      `SELECT
         id,
         recipient_email,
         subject,
         body,
         status,
         scheduled_at,
         sent_at
       FROM email_jobs
       WHERE campaign_id = $1
       ORDER BY scheduled_at ASC`,
      [id]
    );

    const statsResult = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'sent')::int AS sent,
         COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
       FROM email_jobs
       WHERE campaign_id = $1`,
      [id]
    );

    return res.status(200).json({
      campaign: campaignResult.rows[0],
      statistics: statsResult.rows[0],
      jobs: jobsResult.rows
    });

  } catch (error) {
    console.error("Get campaign details error:", error);

    return res.status(500).json({
      message: "Failed to fetch campaign details"
    });
  }
};


// Update campaign status
export const updateCampaignStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "draft",
      "active",
      "paused",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Use draft, active, paused or completed."
      });
    }

    // Update campaign status
    const result = await pool.query(
      `UPDATE campaigns
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    // When campaign becomes active,
    // queue all pending email jobs.
    if (status === "active") {

      const pendingJobs = await pool.query(
        `SELECT *
         FROM email_jobs
         WHERE campaign_id = $1
           AND status = 'pending'`,
        [id]
      );

      console.log(
        `🔄 Checking ${pendingJobs.rows.length} pending jobs`
      );

      for (const dbJob of pendingJobs.rows) {

        // Check whether an old BullMQ job exists.
        const existingJob = await emailQueue.getJob(dbJob.id);

        if (existingJob) {
          console.log(
            `🧹 Removing existing BullMQ job: ${dbJob.id}`
          );

          try {
            await existingJob.remove();
          } catch (error) {
            console.log(
              `⚠️ Could not remove existing job: ${dbJob.id}`
            );
          }
        }

        // Calculate remaining delay.
        // If scheduled time has already passed,
        // delay becomes 0 and email is sent immediately.
        const delay = Math.max(
          0,
          new Date(dbJob.scheduled_at).getTime() - Date.now()
        );

        console.log(
          `⏰ Queueing email job ${dbJob.id} with delay ${delay}ms`
        );

        await emailQueue.add(
          "send-email",
          {
            jobId: dbJob.id
          },
          {
            delay,
            jobId: dbJob.id,
            removeOnComplete: true,
            removeOnFail: false
          }
        );
      }
    }

    return res.status(200).json({
      message: "Campaign status updated successfully",
      campaign: result.rows[0]
    });

  } catch (error) {
    console.error("Update campaign error:", error);

    return res.status(500).json({
      message: "Failed to update campaign"
    });
  }
};


// Delete campaign
export const deleteCampaign = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM campaigns
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    return res.status(200).json({
      message: "Campaign deleted successfully",
      campaign: result.rows[0]
    });

  } catch (error) {
    console.error("Delete campaign error:", error);

    return res.status(500).json({
      message: "Failed to delete campaign"
    });
  }
};


// Add multiple email jobs to a campaign
// Add multiple email jobs to a campaign
export const addCampaignJobs = async (
  req: Request,
  res: Response
) => {
  try {
    const { campaignId } = req.params;

    const {
      recipients,
      subject,
      body,
      scheduledAt
    } = req.body;

    // Validate input
    if (
      !Array.isArray(recipients) ||
      recipients.length === 0 ||
      !subject ||
      !body ||
      !scheduledAt
    ) {
      return res.status(400).json({
        message:
          "recipients, subject, body and scheduledAt are required"
      });
    }

    // Check campaign exists
    const campaignResult = await pool.query(
      `SELECT *
       FROM campaigns
       WHERE id = $1`,
      [campaignId]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        message: "Campaign not found"
      });
    }

    const campaign = campaignResult.rows[0];

    // Validate scheduled time
    const scheduledTime = new Date(scheduledAt);

    if (isNaN(scheduledTime.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduledAt date"
      });
    }

    // Do not allow scheduling in the past
    if (scheduledTime.getTime() <= Date.now()) {
      return res.status(400).json({
        message: "scheduledAt must be in the future"
      });
    }

    const createdJobs = [];

    // Create one job per recipient
    for (const recipientEmail of recipients) {

      if (
        typeof recipientEmail !== "string" ||
        !recipientEmail.includes("@")
      ) {
        continue;
      }

      // Prevent duplicate pending job for same campaign + recipient
      const existingJob = await pool.query(
        `SELECT id
         FROM email_jobs
         WHERE campaign_id = $1
           AND recipient_email = $2
           AND status = 'pending'
         LIMIT 1`,
        [campaignId, recipientEmail]
      );

      if (existingJob.rows.length > 0) {
        console.log(
          `⏭️ Duplicate pending job skipped for ${recipientEmail}`
        );
        continue;
      }

      // Save job in PostgreSQL
      const result = await pool.query(
        `INSERT INTO email_jobs
         (
           campaign_id,
           recipient_email,
           subject,
           body,
           scheduled_at,
           status
         )
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [
          campaignId,
          recipientEmail,
          subject,
          body,
          scheduledTime
        ]
      );

      const job = result.rows[0];

      // Calculate BullMQ delay
      const delay = Math.max(
        0,
        scheduledTime.getTime() - Date.now()
      );

      // Only queue active campaigns
      if (campaign.status === "active") {

        await emailQueue.add(
          "send-email",
          {
            jobId: job.id
          },
          {
            delay,
            jobId: job.id,
            removeOnComplete: true,
            removeOnFail: false
          }
        );

        console.log(
          `📨 Job queued: ${job.id} with delay ${delay}ms`
        );

      } else {

        console.log(
          `⏸️ Campaign is ${campaign.status}. Job saved but not queued.`
        );
      }

      createdJobs.push(job);
    }

    return res.status(201).json({
      message: "Campaign email jobs created successfully",
      campaignId,
      count: createdJobs.length,
      jobs: createdJobs
    });

  } catch (error) {
    console.error("Add campaign jobs error:", error);

    return res.status(500).json({
      message: "Failed to create campaign email jobs"
    });
  }
};