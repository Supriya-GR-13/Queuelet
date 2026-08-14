import { Request, Response } from "express";
import pool from "../config/database";
import { emailQueue } from "../queues/emailQueue";

// Create a new email job
export const createJob = async (req: Request, res: Response) => {
  try {
    const {
      recipientEmail,
      subject,
      body,
      scheduledAt,
      campaignId 
    } = req.body;


    // Validate required fields
    if (!recipientEmail || !subject || !body || !scheduledAt) {
      return res.status(400).json({
        message:
          "recipientEmail, subject, body and scheduledAt are required"
      });
    }

    // Validate scheduled time
    const scheduledTime = new Date(scheduledAt);

    if (isNaN(scheduledTime.getTime())) {
      return res.status(400).json({
        message: "Invalid scheduledAt date"
      });
    }

    // Save job in PostgreSQL
    const result = await pool.query(
      `INSERT INTO email_jobs
       (campaign_id,recipient_email, subject, body, scheduled_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        campaignId || null,
        recipientEmail,
        subject,
        body,
        scheduledTime
      ]
    );

    const job = result.rows[0];

    // Calculate delay for BullMQ
    const delay = Math.max(
      0,
      scheduledTime.getTime() - Date.now()
    );

    console.log(
      `⏰ Scheduling email job for ${scheduledTime.toISOString()}`
    );

    console.log(
      `⏳ Delay: ${Math.round(delay / 1000)} seconds`
    );

    // Add job to BullMQ
    await emailQueue.add(
      "send-email",
      {
        jobId: job.id
      },
      {
        delay,
        jobId: job.id
      }
    );

    return res.status(201).json({
      message: "Email job created successfully",
      job
    });

  } catch (error) {
    console.error("Create job error:", error);

    return res.status(500).json({
      message: "Failed to create email job"
    });
  }
};


// Get all email jobs
export const getJobs = async (
  _req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM email_jobs
       ORDER BY scheduled_at ASC`
    );

    return res.status(200).json({
      jobs: result.rows
    });

  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      message: "Failed to fetch email jobs"
    });
  }
};


// Get a single email job
export const getJobById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM email_jobs
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Email job not found"
      });
    }

    return res.status(200).json({
      job: result.rows[0]
    });

  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      message: "Failed to fetch email job"
    });
  }
};


// Delete an email job
export const deleteJob = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Remove from PostgreSQL
    const result = await pool.query(
      `DELETE FROM email_jobs
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Email job not found"
      });
    }

    // Find corresponding BullMQ job
    const queueJobs = await emailQueue.getJobs([
      "waiting",
      "delayed",
      "active"
    ]);

    const queueJob = queueJobs.find(
      (queueJob) => queueJob.data?.jobId === id
    );

    if (queueJob) {
      await queueJob.remove();
      console.log(`🗑️ BullMQ job removed: ${id}`);
    }

    return res.status(200).json({
      message: "Email job deleted successfully",
      job: result.rows[0]
    });

  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      message: "Failed to delete email job"
    });
  }
};