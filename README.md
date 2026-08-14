# Queuelet

Queuelet is an email campaign scheduler: create a campaign, add recipients,
write a subject/body, pick a send time, and Queuelet queues and sends the
emails for you (via BullMQ + Redis + nodemailer), tracking delivery status
per recipient.

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis, BullMQ, Nodemailer
- **Frontend**: React, TypeScript, Vite

## Project structure

```
backend/    Express API + BullMQ worker
frontend/   React dashboard (Vite)
docker-compose.yml   Local Postgres + Redis for development
```

## 1. Start Postgres and Redis

The easiest way is Docker Compose, which also loads `backend/database/schema.sql`
automatically on first boot:

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5434` (db `queuelet`, user `queuelet`, password `queuelet123`)
- Redis on `localhost:6379`

Don't have Docker? Install Postgres and Redis yourself and run
`backend/database/schema.sql` against your database once, then update the
`DB_*` values in `backend/.env` to match your instance.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env` and fill in real SMTP credentials so the worker can actually send
mail (for local testing, a free sandbox inbox like
[Ethereal Email](https://ethereal.email) or Mailtrap works well — emails
never really leave the sandbox).

Run the API and the worker in two terminals:

```bash
npm run dev      # API server on http://localhost:5000
npm run worker   # BullMQ worker that sends the actual emails
```

Both need to be running — the API creates and schedules jobs, the worker is
what actually sends them at their scheduled time.

Health check: `GET http://localhost:5000/api/health`

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). Click
**"Continue as Demo User"** — this creates (or reuses) a real user record in
Postgres via `POST /api/users/login`, no password required in this build.

From there you can:
- View live campaign stats on the **Dashboard**
- Browse campaigns on the **Campaigns** page and drill into a campaign's
  individual scheduled emails and their live status
- **Create Campaign**: add recipients, subject, body, and a send time, then
  either save as a draft or schedule & activate it immediately
- View aggregate delivery/failure numbers on **Analytics**

## API overview

| Method | Endpoint                              | Description                          |
|--------|----------------------------------------|---------------------------------------|
| POST   | `/api/users/login`                    | Find-or-create a user by email        |
| GET    | `/api/users/:id`                      | Get a user                            |
| POST   | `/api/campaigns`                      | Create a campaign                     |
| GET    | `/api/campaigns?userId=`              | List campaigns (with job stats)       |
| GET    | `/api/campaigns/:id`                  | Campaign detail + stats + jobs        |
| PATCH  | `/api/campaigns/:id/status`           | Update status (draft/active/paused/completed) |
| DELETE | `/api/campaigns/:id`                  | Delete a campaign                     |
| POST   | `/api/campaigns/:campaignId/jobs`     | Bulk-add recipients/emails to a campaign |
| POST   | `/api/jobs`                           | Create a single standalone email job  |
| GET    | `/api/jobs`                           | List all email jobs                   |
| GET    | `/api/jobs/:id`                       | Get a single email job                |
| DELETE | `/api/jobs/:id`                       | Delete an email job                   |

Setting a campaign's status to `active` queues all of its pending jobs in
BullMQ with a delay matching their `scheduled_at` time; the worker sends them
when that delay elapses.
