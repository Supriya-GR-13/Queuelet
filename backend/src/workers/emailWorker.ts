import { Worker } from "bullmq";
import pool from "../config/database";
import redisConnection from "../config/redis";
import transporter from "../config/mailer";

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log(`📨 Processing email job: ${job.data.jobId}`);

    const { jobId } = job.data;

    try {
      // Get email job + campaign status
      const result = await pool.query(
        `SELECT
           ej.*,
           c.status AS campaign_status
         FROM email_jobs ej
         LEFT JOIN campaigns c
           ON ej.campaign_id = c.id
         WHERE ej.id = $1`,
        [jobId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Email job ${jobId} not found`);
      }

      const emailJob = result.rows[0];

      // Check campaign status
      if (
        emailJob.campaign_id &&
        emailJob.campaign_status !== "active"
      ) {
        console.log(
          `⏸️ Campaign is ${emailJob.campaign_status}. Email will not be sent.`
        );

        return {
          success: false,
          skipped: true,
          reason: `Campaign is ${emailJob.campaign_status}`,
          jobId
        };
      }

      console.log("Recipient:", emailJob.recipient_email);
      console.log("Subject:", emailJob.subject);

      // Send real email
      console.log("📤 Sending real email...");

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailJob.recipient_email,
          subject: emailJob.subject,
          text: emailJob.body
        });
      } catch (sendError: any) {
        console.error(
          `❌ Email sending failed for job ${jobId}:`,
          sendError.message
        );

        // Update database as failed
        await pool.query(
          `UPDATE email_jobs
           SET status = 'failed',
               attempts = attempts + 1
           WHERE id = $1`,
          [jobId]
        );

        // Save failure log
        await pool.query(
          `INSERT INTO email_logs
           (job_id, status, sent_at)
           VALUES ($1, $2, NOW())`,
          [jobId, "failed"]
        );

        // Re-throw so BullMQ also knows the job failed
        throw sendError;
      }

      console.log("✅ Real email sent successfully");

      // Update email job
      await pool.query(
        `UPDATE email_jobs
         SET status = 'sent',
             sent_at = NOW(),
             attempts = attempts + 1
         WHERE id = $1`,
        [jobId]
      );

      // Save successful email log
      await pool.query(
        `INSERT INTO email_logs
         (job_id, status, sent_at)
         VALUES ($1, $2, NOW())`,
        [jobId, "sent"]
      );

      console.log("📧 Email log saved successfully");

      return {
        success: true,
        jobId
      };

    } catch (error: any) {
      console.error(
        `❌ Worker error for job ${jobId}:`,
        error.message
      );

      // If the job wasn't already marked failed,
      // mark it failed here.
      await pool.query(
        `UPDATE email_jobs
         SET status = 'failed',
             attempts = attempts + 1
         WHERE id = $1
           AND status = 'pending'`,
        [jobId]
      );
      await pool.query(
        `INSERT INTO email_logs
         (job_id, status, sent_at)
         VALUES ($1, $2, NOW())`,
        [jobId, "failed"]
      );

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

emailWorker.on("completed", (job) => {
  console.log(
    `✅ Worker completed job: ${job.id}`
  );
});

emailWorker.on("failed", (job, error) => {
  console.error(
    `❌ Worker failed job: ${job?.id}`,
    error.message
  );
});

console.log("📬 Email worker started...");