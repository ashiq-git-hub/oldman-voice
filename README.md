# oldman.voice

> *"Everyone has something to say."*

A daily anonymous question-and-response platform designed with the restraint and elegance of an **old-money literary journal and private correspondence room**.

---

## 1. Principles & Privacy Guarantee

- **One Question, One Answer, No Names Attached**: Every day presents a single reflective inquiry.
- **Zero Identity Collection**: Technically minimized database storage:
  - ❌ No names, emails, usernames, phone numbers
  - ❌ No IP addresses or geolocation
  - ❌ No user-agent, device fingerprints, or browser fingerprints
  - ❌ No session IDs or tracking pixels
  - ❌ No analytics or respondent profiles
- **Strict Row-Level Security (RLS)**: Public clients can **INSERT** responses, but are cryptographically prevented from ever querying or reading the `responses` table.
- **Private Archive**: Only the authenticated site owner can read responses via the private admin dashboard.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Server Actions/API)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (warm parchment, deep ink charcoal, antique brass, muted olive)
- **Typography**: Cormorant Garamond & Inter via `next/font/google`
- **Database & Auth**: Supabase PostgreSQL with Row Level Security & Supabase Auth
- **Deployment**: Vercel & GitHub

---

## 3. Database Schema & RLS

The database migration is located in `supabase/migrations/20261005000000_init_oldman_voice.sql`.

### Tables:

#### `public.questions`
- `id` (uuid, primary key)
- `question` (text, not null)
- `question_date` (date, unique, not null)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())

#### `public.responses`
- `id` (uuid, primary key)
- `question_id` (uuid, foreign key to questions.id on delete cascade)
- `response` (text, not null, max 2000 chars)
- `created_at` (timestamptz, default now())

*(Notice: There are zero columns for IP, identity, browser, or metadata.)*

---

## 4. Step-by-Step Setup & Deployment Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project**, select an organization, name it `oldman-voice`, choose a region close to your primary audience, and set a strong database password.

### Step 2: Create Database Tables & RLS Policies
1. In the Supabase Dashboard, open the **SQL Editor** on the left menu.
2. Click **New Query**, paste the contents of `supabase/migrations/20261005000000_init_oldman_voice.sql`, and click **Run**.
3. Confirm that the `questions` and `responses` tables have been created with initial seed inquiries and RLS enabled.

### Step 3: Enable RLS Verification
- Under **Table Editor > responses**, verify that **RLS is enabled**.
- Notice that there is an `INSERT` policy for public access, but **no `SELECT` policy** for anon/public users. Only authenticated admins have `SELECT` and `DELETE` access.

### Step 4: Create Admin Authentication
1. Go to **Authentication > Users** in Supabase.
2. Click **Add User** -> **Create User**.
3. Enter your owner email (e.g. `owner@oldman.voice` or your personal email) and a secure password.
4. Toggle **Auto Confirm User?** to `true` (so you can log in immediately without email confirmation).

### Step 5: Configure Environment Variables Locally
1. In your Supabase dashboard, go to **Project Settings > API**.
2. Copy the following keys:
   - `Project URL`
   - `anon public` key
   - `service_role` secret key (under Project API keys; click Reveal)
3. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

### Step 6: Run the Application Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Public journal: `http://localhost:3000`
- About page: `http://localhost:3000/about`
- Private archive login: `http://localhost:3000/admin/login`

*(Note: If you run locally before setting up Supabase, the app automatically runs in local development preview mode with curated seed questions).*

### Step 7: Push to GitHub
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for oldman.voice"
   ```
2. Create a repository on GitHub (e.g. `github.com/your-username/oldman-voice`).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/your-username/oldman-voice.git
   git branch -M main
   git push -u origin main
   ```

### Step 8: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New... > Project** and import your `oldman-voice` repository.
3. Framework Preset will automatically detect **Next.js**.

### Step 9: Configure Vercel Environment Variables
Under the **Environment Variables** section in Vercel before clicking Deploy:
- `NEXT_PUBLIC_SUPABASE_URL`: (your Supabase URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (your Supabase anon key)
- `SUPABASE_SERVICE_ROLE_KEY`: (your Supabase service role key)
Click **Deploy**.

### Step 10: Configure Custom Domain (Optional)
In Vercel, navigate to **Project Settings > Domains** and add your custom domain (e.g. `oldmanvoice.com`). Set up the CNAME / A records at your DNS registrar.

### Step 11: Test Anonymous Submission
1. Open the public production website on your mobile device (e.g. 390px viewport) or desktop.
2. Read today's question.
3. Type an answer in the stationery box and tap **send anonymously →**.
4. Verify the subtle microcopy: *"placing your words..."* followed by *"Your words have been placed. Thank you for saying it."*
5. Refresh the browser and observe that your submitted answer is **never displayed** publicly.

### Step 12: Test Admin Access
1. Visit `/admin/login` on your production site.
2. Enter the owner credentials you created in Step 4.
3. You will enter the **private archive** dashboard showing:
   - Today's question and the live count of responses
   - Clean editorial slips containing each anonymous response
   - Individual and bulk delete options
4. Visit `/admin/questions` to schedule questions for upcoming days.
5. Visit `/admin/archive` to browse past days and read their corresponding entries.

### Step 13: Verify Public Security (Cannot Read Responses)
1. Open your browser's Developer Tools or Postman.
2. Send a `GET` request to `/api/responses` or attempt a direct Supabase select query using the anon public key:
   ```bash
   curl https://your-project-id.supabase.co/rest/v1/responses -H "apikey: your-anon-key"
   ```
3. Confirm that the response is empty `[]` or returns 405/403. Public users **cannot** read responses under any circumstances.

---

## 5. Security & Anti-Spam Architecture

- **Honeypot Trap**: Invisible `website_url_hp` field traps automated web crawlers.
- **Privacy-Preserving Ephemeral Rate Limiting**: Hashed token rotating hourly in memory without ever storing client IP or device fingerprints.
- **Payload Validation**: Strict character limit (max 2000 characters) and input sanitization.
- **Server-Side Route Protection**: Direct URL tampering or unauthenticated requests to `/admin`, `/admin/archive`, and `/admin/questions` are rejected server-side.

---

## 6. Microcopy Guidelines

- Avoid corporate or social-media phrasing:
  - ❌ *"Your response has been successfully submitted."*
  - ❌ *"Comments (0)"*
  - ❌ *"Follow us on socials"*
- Favor calm, literary, reflective phrasing:
  - 🌿 *"Your words have been placed."*
  - 🌿 *"Thank you for saying it."*
  - 🌿 *"Today's question is still being written."*
  - 🌿 *"placing your words..."*
  - 🌿 *"Everyone has something to say."*
