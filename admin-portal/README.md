# ನ್ಯಾಯ ಘರ್ಜನೆ - ಆಡಳಿತ ಮಂಡಳಿ (Admin Portal)
**Standalone Subdomain Application (`admin.nyaayagharjane.com`)**

This folder contains the dedicated, standalone Next.js application for the **Nyaayagharjane E-Newspaper Admin Portal**. It is completely separated from the public newspaper reader website.

---

## 🚀 Local Development

You can run both applications side-by-side:

### 1. Start Main Website (Reader & Public Pages)
From the root directory:
```bash
npm run dev
# Running on http://localhost:3001
```

### 2. Start Admin Portal
From the root directory:
```bash
npm run dev:admin
# OR: cd admin-portal && npm run dev
# Running on http://localhost:3002
```

---

## 🌐 Routes on Subdomain (`admin.nyaayagharjane.com`)

Because this runs on its own subdomain, all routes are clean and direct:

| Page | URL Path on Subdomain | Description |
|---|---|---|
| **Root Redirect** | `/` | Checks session: redirects to `/dashboard` or `/login` |
| **Login** | `/login` | Secure Firebase Auth administrator sign-in |
| **Dashboard** | `/dashboard` | Metrics overview (KPIs, active papers, recent editions) |
| **Manage Papers** | `/papers` | List, publish/unpublish, edit, delete editions |
| **Upload Paper** | `/upload` | PDF chunked / presigned upload to Cloudflare R2 |
| **Guide** | `/guide` | Publishing workflow & 5-step checklist |
| **Connectivity** | `/verifier` | R2 catalogue, CDN, and bucket health tester |
| **Settings** | `/settings` | Chief Admin credentials, contact info, security |

---

## 🚢 Deployment to Subdomain (`admin.nyaayagharjane.com`)

### Vercel Deployment:
1. Create a **New Project** on Vercel and select the `Nyaayagharjane` GitHub repository.
2. In **Project Settings**:
   * Set **Root Directory** to `admin-portal`.
3. In **Domains**:
   * Add `admin.nyaayagharjane.com`.
4. In **Environment Variables**:
   * Copy the variables from `admin-portal/.env` (Firebase config & Cloudflare R2 credentials).

### Cloudflare Pages Deployment:
1. Create a Cloudflare Pages project linked to the same repository.
2. Set **Root Directory** to `admin-portal`.
3. Set **Custom Domain** to `admin.nyaayagharjane.com`.

---

## 🔒 Security & Separation
* The public website at `nyaayagharjane.com` has **zero admin routes**. Visiting `/admin` or `/login` on the public website returns **404 Not Found**.
* The Admin Portal at `admin.nyaayagharjane.com` is isolated with its own layout, Firebase session management, and database health monitors.
