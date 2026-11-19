# Nyaayagharjane E-Newspaper — Cloudflare Worker Security Gateway

A lightweight, serverless security gateway built with **Cloudflare Workers**, **Firebase Authentication**, and **Cloudflare R2 Object Storage**.

---

## 1. Architecture Overview

1. **Firebase Authentication**: The administrator signs in with their credentials via Firebase Client SDK. The frontend retrieves a cryptographically signed Firebase ID token.
2. **Serverless Gateway (Worker)**:
   - Verifies the Firebase ID token signature against Google's public JWKS (`https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`).
   - Validates token `iss`, `aud`, `exp`, `iat`, and `sub` (Firebase UID).
   - Validates the UID against the `ADMIN_UIDS` secret allowlist.
   - Rejects unauthorized users with `HTTP 403 Forbidden` and invalid tokens with `HTTP 401 Unauthorized`.
3. **Presigned R2 Upload URLs**:
   - The Worker validates file size (max 100MB), MIME type (`application/pdf`), and sanitizes the filename to prevent directory traversal.
   - Generates an AWS SigV4 presigned `PUT` URL valid for only 15 minutes restricted to that exact object key and `Content-Type: application/pdf`.
4. **Direct Browser-to-R2 Upload**: The browser uploads the PDF directly to R2 via the presigned URL, completely avoiding proxying heavy binary data through server memory.
5. **Atomic Catalogue Update**: Upon completion, the Worker verifies the uploaded object exists in R2 via its `NEWSPAPERS_BUCKET` binding, validates metadata, and safely updates `data/newspapers.json` with deduplication protection.

---

## 2. API Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check, reports R2 & Firebase configuration status |
| `GET` | `/api/catalogue` | No | Returns all published newspaper editions from R2 |
| `POST` | `/api/upload/request` | **Yes (Admin)** | Generates a presigned R2 PUT URL for direct upload |
| `POST` | `/api/upload/complete` | **Yes (Admin)** | Verifies file in R2 & updates `data/newspapers.json` |
| `PATCH` | `/api/catalogue/:id` | **Yes (Admin)** | Updates edition status or metadata |
| `DELETE` | `/api/catalogue/:id` | **Yes (Admin)** | Deletes PDF from R2 and removes entry from catalogue |

---

## 3. Cloudflare Setup & Configuration

### Prerequisites
- Node.js 18+ installed
- Cloudflare account with R2 enabled
- Cloudflare Wrangler CLI: `npm install -g wrangler` or `npx wrangler`

### Step 1: Install Worker Dependencies
```bash
cd worker
npm install
```

### Step 2: Configure `wrangler.toml` Variables
Review `worker/wrangler.toml` and confirm the variables match your project:
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (e.g. `nyaayagharjane`)
- `R2_ACCOUNT_ID`: Your Cloudflare Account ID
- `R2_BUCKET_NAME`: `enewspaper-storage`
- `R2_PUBLIC_DOMAIN`: Your custom public domain or r2.dev domain
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (e.g. `https://nyaayagharjane.com,http://localhost:3000,http://localhost:3001`)

### Step 3: Set Worker Secrets
Run the following commands in the `worker/` directory:

```bash
# 1. Cloudflare R2 S3 Access Key ID
npx wrangler secret put R2_ACCESS_KEY_ID

# 2. Cloudflare R2 S3 Secret Access Key
npx wrangler secret put R2_SECRET_ACCESS_KEY

# 3. Comma-separated list of approved Administrator Firebase UIDs
# Example: 4F2g8K1m9XpL0qRtUvWxYz,8aB9cD0eF1g2H3i4J5k6L7
npx wrangler secret put ADMIN_UIDS
```

---

## 4. Configure Cloudflare R2 CORS

To allow browsers to upload PDF files directly to R2 using presigned URLs, apply the CORS configuration to your R2 bucket.

### Option A: Using Wrangler CLI
```bash
npx wrangler r2 bucket cors set enewspaper-storage --file=r2-cors.json
```

### Option B: Using Cloudflare Dashboard
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **R2** > Click on your bucket (`enewspaper-storage`).
3. Click the **Settings** tab.
4. Scroll down to **CORS Policy** and click **Add CORS Policy**.
5. Paste the contents of `worker/r2-cors.json`:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://nyaayagharjane.com",
         "https://www.nyaayagharjane.com",
         "http://localhost:3000",
         "http://localhost:3001"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["content-type", "content-length", "x-amz-*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
6. Click **Save**.

---

## 5. Deployment Instructions

### Local Development / Testing
```bash
cd worker
npm run dev
```
The Worker will start locally at `http://localhost:8787`.

### Production Deployment
```bash
cd worker
npm run deploy
```
Wrangler will output your live Worker URL (e.g., `https://nyaayagharjane-worker.<subdomain>.workers.dev`).

Add this URL to your frontend `.env.local`:
```env
NEXT_PUBLIC_WORKER_URL=https://nyaayagharjane-worker.<subdomain>.workers.dev
```

---

## 6. Testing Instructions

### Test 1: Health Check (Public)
```bash
curl -i https://nyaayagharjane-worker.<subdomain>.workers.dev/api/health
```
**Expected Response:** `HTTP 200 OK`
```json
{
  "status": "healthy",
  "service": "nyaayagharjane-worker",
  "r2BindingConfigured": true,
  "firebaseConfigured": true,
  "r2CredentialsConfigured": true
}
```

### Test 2: Unauthorized Access (No Token)
```bash
curl -i -X POST https://nyaayagharjane-worker.<subdomain>.workers.dev/api/upload/request \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.pdf", "year": 2026, "month": 11}'
```
**Expected Response:** `HTTP 401 Unauthorized`
```json
{
  "error": "Missing or invalid Authorization header. Expected 'Bearer <FIREBASE_ID_TOKEN>'"
}
```

### Test 3: Unauthorized Access (Valid Firebase User, but Not in ADMIN_UIDS)
1. Sign in as a regular non-admin user in Firebase and obtain their ID token.
2. Send request:
```bash
curl -i -X POST https://nyaayagharjane-worker.<subdomain>.workers.dev/api/upload/request \
  -H "Authorization: Bearer <NON_ADMIN_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.pdf", "year": 2026, "month": 11}'
```
**Expected Response:** `HTTP 403 Forbidden`
```json
{
  "error": "Forbidden: Your account is not authorized as an administrator."
}
```

### Test 4: Authorized Admin Upload Flow
1. Obtain an ID token from an approved admin user (whose UID is in `ADMIN_UIDS`).
2. Request a presigned URL:
```bash
curl -i -X POST https://nyaayagharjane-worker.<subdomain>.workers.dev/api/upload/request \
  -H "Authorization: Bearer <ADMIN_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"filename": "nyaayagharjane_november_2026.pdf", "year": 2026, "month": 11, "fileSizeBytes": 5242880}'
```
**Expected Response:** `HTTP 200 OK`
```json
{
  "success": true,
  "uploadUrl": "https://<account>.r2.cloudflarestorage.com/enewspaper-storage/newspapers/2026/11-november/nyaayagharjane_november_2026.pdf?X-Amz-...",
  "objectKey": "newspapers/2026/11-november/nyaayagharjane_november_2026.pdf",
  "publicPdfUrl": "https://pub-...r2.dev/newspapers/2026/11-november/nyaayagharjane_november_2026.pdf",
  "expiresInSeconds": 900
}
```

3. Direct Upload to R2 via Presigned URL:
```bash
curl -i -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"
```
**Expected Response:** `HTTP 200 OK`

4. Finalize and Update Catalogue:
```bash
curl -i -X POST https://nyaayagharjane-worker.<subdomain>.workers.dev/api/upload/complete \
  -H "Authorization: Bearer <ADMIN_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "objectKey": "newspapers/2026/11-november/nyaayagharjane_november_2026.pdf",
    "title": "ನ್ಯಾಯ ಘರ್ಜನೆ — ನವೆಂಬರ್ ೨೦೨೬",
    "year": 2026,
    "month": 11,
    "editionArea": "Karnataka State",
    "language": "Kannada",
    "totalPages": 16,
    "status": "published"
  }'
```
**Expected Response:** `HTTP 200 OK`
```json
{
  "success": true,
  "message": "Newspaper published and catalogue updated in R2 successfully.",
  "item": {
    "id": "news-2026-11",
    "title": "ನ್ಯಾಯ ಘರ್ಜನೆ — ನವೆಂಬರ್ ೨೦೨೬",
    "status": "published",
    "pdfUrl": "https://pub-...r2.dev/newspapers/2026/11-november/nyaayagharjane_november_2026.pdf"
  }
}
```
