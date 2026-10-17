# Photo Studio Website: frontend + backend

A minimal, elegant, mobile-first website for a photographer and photo studio, split into
two separate apps:

| Part         | What it is                                                                 | Port   |
| ------------ | -------------------------------------------------------------------------- | ------ |
| `frontend/`  | The website visitors see (Next.js, TypeScript, Tailwind, Framer Motion)    | `3000` |
| `backend/`   | The API that saves bookings and messages in Supabase (Next.js, API only)   | `4000` |

The frontend sends the Booking and Contact forms to the backend. The backend checks them,
saves them in Supabase and (optionally) emails the studio owner. A future mobile app can
call the same backend endpoints.

---

## 1. Folder structure

```
studio-website/
├── README.md                 This file
├── .gitignore
├── frontend/                 THE WEBSITE  (port 3000)
│   ├── package.json
│   ├── .env.example          -> copy to .env.local
│   ├── next.config.ts  tsconfig.json  eslint.config.mjs  .prettierrc
│   ├── public/images/        Put your own photos here
│   └── src/
│       ├── app/              Pages: home, portfolio, services, about, booking, contact, 404
│       │   └── globals.css   THE THEME: colors, radius, spacing, fonts
│       ├── components/       layout, home, gallery, forms, ui
│       ├── data/             site.ts (brand, contact), services, portfolio, testimonials
│       ├── lib/
│       │   ├── api.ts        Sends form data to the backend (uses NEXT_PUBLIC_API_URL)
│       │   ├── validation.ts zod rules: instant feedback in the forms
│       │   ├── supabase/client.ts   Browser Supabase client (not used yet)
│       │   └── metadata.ts, utils.ts
│       └── types/index.ts
└── backend/                  THE API  (port 4000)
    ├── package.json
    ├── .env.example          -> copy to .env.local
    ├── next.config.ts  tsconfig.json  eslint.config.mjs  .prettierrc
    ├── supabase/schema.sql   Database tables + security rules (run once in Supabase)
    └── src/
        ├── proxy.ts          CORS: which websites may call the API
        ├── app/api/
        │   ├── booking/route.ts   POST /api/booking
        │   ├── contact/route.ts   POST /api/contact
        │   └── health/route.ts    GET  /api/health  ("is the backend running?")
        ├── lib/
        │   ├── validation.ts      zod rules: the real safety check
        │   ├── supabase/server.ts Supabase client (secret key, server only)
        │   ├── rate-limit.ts      Per-IP rate limit
        │   └── email.ts           Optional Resend notifications
        ├── data/              site.ts (studio name), services.ts (valid service slugs)
        └── types/index.ts
```

---

## 2. Requirements

- [Node.js](https://nodejs.org) 20 or newer (includes `npm`)
- A free [Supabase](https://supabase.com) project (for saving data)
- Optional: a free [Resend](https://resend.com) account (for email notifications)

---

## 3. Install

Each part has its own dependencies. Install both:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 4. Environment variables

Copy each `.env.example` to `.env.local` and fill it in. **Never commit `.env.local`** and never
put real keys in `.env.example`. (The zip you received contains only the `.env.example` files.)

```bash
cp backend/.env.example  backend/.env.local
cp frontend/.env.example frontend/.env.local
```

### Backend (`backend/.env.local`)

| Variable                    | Needed? | What it is                                                                  |
| --------------------------- | ------- | --------------------------------------------------------------------------- |
| `SUPABASE_URL`              | Yes     | Supabase Project URL, e.g. `https://abcdefghijkl.supabase.co`               |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes     | Supabase `service_role` (secret) key. Server only, never share it           |
| `ALLOWED_ORIGINS`           | Yes     | Address(es) of the frontend allowed to call the API. Default `http://localhost:3000`. Several: separate with commas, no trailing slash |
| `RESEND_API_KEY`            | No      | Turns on email notifications                                                |
| `NOTIFY_EMAIL_TO`           | No      | Inbox that receives the notifications                                       |
| `RESEND_FROM_EMAIL`         | No      | Sender address (`onboarding@resend.dev` works for testing)                  |
| `STUDIO_NAME`               | No      | Studio name used in emails                                                  |

Find the Supabase values in the dashboard under **Project Settings → API** (the keys may be called
"anon/public" and "service_role", or "publishable" and "secret": use the secret one here).
The older name `NEXT_PUBLIC_SUPABASE_URL` still works as a fallback for `SUPABASE_URL`.

### Frontend (`frontend/.env.local`)

| Variable                 | Needed? | What it is                                                              |
| ------------------------ | ------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | Yes     | Address of the backend, e.g. `http://localhost:4000` (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL`   | Yes     | Public address of the website (SEO links), e.g. `http://localhost:3000` |

> `NEXT_PUBLIC_` values are baked in when you run `npm run build`. For production, set them
> **before** building the frontend. Backend variables are read when the server starts.

---

## 5. Create the database tables (one time)

1. In the Supabase dashboard, open **SQL Editor** and click **New query**.
2. Copy **all** of `backend/supabase/schema.sql`, paste it in and click **Run**.
3. You should see "Success. No rows returned". The `bookings` and `contacts` tables now exist
   (check **Table Editor**), protected by Row Level Security so only the backend can write to them.

It is safe to run again later: it never deletes data.

---

## 6. Run it: backend first, then frontend

Open **two terminals**.

**Terminal 1: backend (start this first)**

```bash
cd backend
npm run dev          # http://localhost:4000
```

Check it: open <http://localhost:4000/api/health>. You should see `{"ok":true,"service":"studio-backend"}`.

**Terminal 2: frontend**

```bash
cd frontend
npm run dev          # http://localhost:3000
```

Open <http://localhost:3000>. For a production-style run use `npm run build` and then `npm run start`
in each folder (backend first).

Other commands (in either folder): `npm run lint`, `npm run build`, `npm run format`.

### Test it yourself

1. Open <http://localhost:3000/booking>, fill in the form (date today or later) and send it.
   You should see "Request received".
2. In Supabase open **Table Editor → bookings**: the new row is there with status `pending`.
3. Do the same on <http://localhost:3000/contact> and check the `contacts` table.

---

## 7. Where to change things

| I want to change...                          | Edit this                                                |
| -------------------------------------------- | -------------------------------------------------------- |
| Colors, radius, spacing                      | `frontend/src/app/globals.css` (top of the file)         |
| Fonts                                        | `frontend/src/app/layout.tsx`                            |
| Brand name, phone, email, WhatsApp, menu     | `frontend/src/data/site.ts`                              |
| Services                                     | `frontend/src/data/services.ts` **and** `backend/src/data/services.ts` |
| Portfolio photos, testimonials               | `frontend/src/data/portfolio.ts`, `testimonials.ts`      |
| Form rules (lengths, required fields)        | `frontend/src/lib/validation.ts` **and** `backend/src/lib/validation.ts` (and `backend/supabase/schema.sql`) |
| Which websites may call the API (CORS)       | `ALLOWED_ORIGINS` in `backend/.env.local`                |

### Keep these in sync

Because the two apps are separate, a few small things exist in both. When you change one, change
the other: the **service slugs** (`data/services.ts`), the **validation rules** (`lib/validation.ts`)
and the **form/API types** (`types/index.ts`).

---

## 8. How a form submission travels

1. The visitor submits the form. The frontend checks it (zod) and sends JSON to
   `NEXT_PUBLIC_API_URL` + `/api/booking` (or `/api/contact`).
2. The browser first asks the backend "may this website call you?" (CORS). `backend/src/proxy.ts`
   answers yes only for the addresses in `ALLOWED_ORIGINS`.
3. The backend route applies a rate limit (5 per IP per 10 minutes), a hidden honeypot field,
   validation, then saves the row in Supabase with the secret key, and emails the owner if Resend is set up.
4. The frontend shows the success message or a safe error message.

Status codes: `201` saved · `400` invalid input · `403` origin not allowed · `429` too many requests ·
`500` server problem. Technical details are only written to the backend's terminal log.

---

## 9. Troubleshooting

| Symptom                                                         | Likely cause and fix                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Form says "Something went wrong. Please check your connection…" | The backend is not running, or `NEXT_PUBLIC_API_URL` is wrong. Restart the frontend after changing it |
| Browser console shows a CORS error / backend log says "Blocked request from origin" | Add the frontend's exact address (for example `http://localhost:3000`) to `ALLOWED_ORIGINS` in `backend/.env.local` and restart the backend |
| Form says "Sorry, something went wrong on our side"             | Look at the backend terminal: usually missing Supabase values or the SQL from step 5 not run |
| Changed `.env.local` but nothing changed                        | Restart the server. For the frontend in production, rebuild                          |

---

## 10. Deploying later

Deploy the two folders as two separate projects (for example both on Vercel).

1. Deploy `backend/` first and set its environment variables. Set `ALLOWED_ORIGINS` to the final
   website address, e.g. `https://www.yourstudio.com`.
2. Deploy `frontend/` with `NEXT_PUBLIC_API_URL` set to the backend's address, e.g. `https://api.yourstudio.com`.

**Good to know:** the rate limit keeps its counters in memory, so on serverless hosting it only slows
down simple spam bursts. For strict limits, switch to a shared store such as Upstash Redis.

---

## 11. Admin Portal & Dashboard

A secure, private administration portal built with Next.js App Router, `@supabase/ssr`, and Tailwind CSS theme tokens.

### Admin URLs

| Route              | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `/admin/login`     | Secure administrator login with rate-limiting and attacker-safe error messages  |
| `/admin`           | Dashboard with KPI metrics, 7-day upcoming sessions, and confirmed date alerts |
| `/admin/users`     | Staff directory: create users, assign roles, view INR payroll, activate/deactivate (Admin only) |
| `/admin/bookings`  | Filterable, searchable, sortable bookings table with CSV export & quick actions |
| `/admin/events`    | Event consultation leads from Sivagangai Events                                |
| `/admin/signboard` | Sign board estimation and order pipeline from Sivagangai Sign Board            |
| `/admin/digital-marketing` | Digital marketing audit requests and growth conversion tracker          |
| `/admin/messages`  | Contact inquiry inbox with read/unread markers and quick contact buttons       |

### Setup `ADMIN_EMAILS` (Super Admins)

In `frontend/.env.local`, specify which emails have super administrative rights (comma-separated):

```bash
ADMIN_EMAILS=admin@sivagangai.com,nithishpantiya@gmail.com
```

> **Immunity & Lockout Prevention:** Any email listed in `ADMIN_EMAILS` is automatically granted the `admin` role and super admin privileges. They can never be deactivated or locked out of the dashboard.

---

## 12. Staff & Users Module

The **Users** module provides role-based access control (RBAC), employee directory management, and confidential payroll management.

### Database Tables

#### 1. `public.staff_users`
Stores all staff profiles and their current privileges:
- `id` (`uuid`, primary key, default `gen_random_uuid()`)
- `auth_user_id` (`uuid`, unique, references `auth.users(id)` on delete cascade)
- `employee_id` (`text`, unique, required, e.g. `EMP-0001`)
- `name` (`text`, required, 2-80 characters)
- `email` (`text`, unique, required, stored lowercase)
- `mobile` (`text`, required, normalized Indian 10-digit mobile)
- `role` (`text`, required: `admin`, `manager`, `photographer`, `editor`, `staff`)
- `salary` (`numeric(12,2)`, required, must be >= 0, formatted in INR)
- `status` (`text`, default `'active'`: `'active'` or `'inactive'`)
- `must_change_password` (`boolean`, default `true`: forces password change on first login)
- `created_at`, `updated_at` (auto-updates via `staff_users_set_updated_at` trigger)

#### 2. `public.staff_audit_log`
Tracks sensitive staff management operations without ever logging passwords:
- `id` (`uuid`, primary key)
- `performed_by_email` (`text`, required)
- `target_user_id` (`uuid`, references `staff_users(id)`)
- `action` (`text`, required: `create`, `edit`, `activate`, `deactivate`, `reset_password`)
- `details` (`jsonb`, changed fields or metadata)
- `created_at` (`timestamptz`, default `now()`)

### Roles & Permissions Matrix

| Capability / Module             | `admin` (or Super Admin) | `manager` | `photographer` | `editor` | `staff` |
| ------------------------------- | :----------------------: | :-------: | :------------: | :------: | :-----: |
| Access `/admin` Dashboard       | Yes                      | Yes       | Yes            | Yes      | Yes     |
| View Bookings, Events & Orders  | Yes                      | Yes       | Yes            | Yes      | Yes     |
| Update Order / Booking Status   | Yes                      | Yes       | Yes            | Yes      | Yes     |
| Access Messages Inbox           | Yes                      | Yes       | Yes            | Yes      | Yes     |
| **Access `/admin/users`**       | **Yes**                  | No        | No             | No       | No      |
| **View Monthly Salaries (INR)** | **Yes**                  | No        | No             | No       | No      |
| **Create New Staff Users**      | **Yes**                  | No        | No             | No       | No      |
| **Edit Staff Details & Roles**  | **Yes**                  | No        | No             | No       | No      |
| **Activate / Deactivate Users** | **Yes**                  | No        | No             | No       | No      |
| **Reset Password to Mobile**    | **Yes**                  | No        | No             | No       | No      |
| **Access `/account/profile`**   | **Yes**                  | **Yes**   | **Yes**        | **Yes**  | **Yes** |

### Mobile-First Staff Authentication & Login Flow

1. **Account Creation (No Temporary Passwords):**
   - When an administrator creates a staff user, there is **no temporary password generated or shared**.
   - The staff member's registered Indian mobile number (normalized to plain 10 digits, e.g. `9876543210`) serves as their initial password.
   - The account is automatically marked with `must_change_password = true`.
   - Creation response shows: `"Account created. Login: <email> / password: the mobile number."` without displaying the raw password value.

2. **Login Page (`/admin/login`):**
   - Staff use the standard login screen with email and their mobile number.
   - If a staff member types their mobile number with `+91`, spaces, or dashes, it is normalized to 10 digits before sign-in attempt (without altering custom passwords).
   - Only active staff members can log in. Inactive accounts receive the neutral message:
     `"Your account is inactive. Contact the admin."`
   - Generic attacker-safe error message: `"Invalid email or password."`

3. **Rate Limiting & Lockout:**
   - Strict brute-force protection: **5 failed attempts per IP** and **5 failed attempts per Email**, enforced independently.
   - Exceeding 5 failed attempts locks out the attacker for **15 minutes**.

4. **First Login Password Change (`/account/change-password`):**
   - On first login (`must_change_password === true`), staff are automatically redirected to `/account/change-password`.
   - All other `/account` and `/admin` routes are blocked (enforced both on the server and in middleware) until the new password is set.
   - Password requirements:
     - Minimum 8 characters.
     - Must differ from registered mobile number.
     - Confirmed twice.
   - Upon successful update, `must_change_password` becomes `false` and the user remains securely signed in.
   - The same Change Password form remains accessible at `/account/profile` for future self-service updates.

5. **Edit vs. Reset Behavior:**
   - **Editing Mobile Number:** Changing a staff member's mobile number in the admin edit modal does **NOT** alter their login password (preserving any custom password they have set).
   - **Reset Password Action:** Replaces the user's login password back to their current registered mobile number and sets `must_change_password = true`. Preceded by an admin confirmation dialog. The password is never displayed on screen or logged.

### How to Run the Database Migration in Supabase

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. In the left-hand navigation, click **SQL Editor**.
3. Run the following SQL command:
   ```sql
   ALTER TABLE public.staff_users 
   ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT true;
   ```
4. If setting up for the first time, run the complete migration script:
   [`backend/supabase/migration_staff_users.sql`](file:///c:/Users/nithish/Documents/studio-website/studio-website/backend/supabase/migration_staff_users.sql).

### Supabase Minimum Password Length Setting

Supabase Auth enforces a minimum password length by default of 6 characters. Since normalized Indian mobile numbers are 10 digits (length 10), they comply with standard default settings.
- If 10-digit mobile passwords are ever rejected by Supabase, verify your setting under:
  **Authentication -> Providers -> Email** or **Authentication -> Sign In / Sign Up settings -> Minimum password length** (ensure it is set to 6 or lower).

