import { Env, UploadRequestPayload, UploadCompletePayload } from "./types";
import { authenticateAdmin } from "./auth";
import {
  sanitizeUploadPath,
  generateR2PresignedPutUrl,
} from "./r2Presign";
import {
  getCatalogueFromR2,
  saveCatalogueToR2,
  addUploadedNewspaperToCatalogue,
  deleteNewspaperFromR2,
} from "./catalogue";
import {
  handleRegisterOptions,
  handleRegisterVerify,
  handleAuthenticateOptions,
  handleAuthenticateVerify,
  handleListCredentials,
  handleDeleteCredential,
} from "./webauthnHandlers";

// Max allowed file size: 100 MB
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Helper to generate CORS headers.
 */
function getCorsHeaders(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  let allowOrigin = "*";
  if (allowed.length > 0) {
    if (allowed.includes(origin)) {
      allowOrigin = origin;
    } else if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowed[0];
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Standard JSON response helper.
 */
function jsonResponse(
  data: unknown,
  status: number,
  request: Request,
  env: Env
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders(request, env),
    },
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env),
      });
    }

    try {
      // 2. Health Check
      if (pathname === "/api/health" && request.method === "GET") {
        const hasBucket = !!env.NEWSPAPERS_BUCKET;
        const hasProject = !!env.FIREBASE_PROJECT_ID;
        const hasCredentials = !!env.R2_ACCESS_KEY_ID && !!env.R2_SECRET_ACCESS_KEY;

        return jsonResponse(
          {
            status: "healthy",
            service: "nyaayagharjane-worker",
            timestamp: new Date().toISOString(),
            r2BindingConfigured: hasBucket,
            firebaseConfigured: hasProject,
            r2CredentialsConfigured: hasCredentials,
          },
          200,
          request,
          env
        );
      }

      // 3. Public / Admin Catalogue Read
      if (pathname === "/api/catalogue" && request.method === "GET") {
        const catalogue = await getCatalogueFromR2(env);
        return jsonResponse({ success: true, count: catalogue.length, data: catalogue }, 200, request, env);
      }

      // -------------------------------------------------------------
      // ADMIN-ONLY ENDPOINTS (Require Firebase Token & UID in ADMIN_UIDS)
      // -------------------------------------------------------------

      // 4. Request Presigned Upload URL
      if (pathname === "/api/upload/request" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }

        const body = (await request.json().catch(() => null)) as UploadRequestPayload | null;
        if (!body || !body.filename) {
          return jsonResponse({ error: "Missing required upload parameters (filename, year, month)." }, 400, request, env);
        }

        // Validate File Size
        if (body.fileSizeBytes && body.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
          return jsonResponse(
            { error: `File exceeds maximum allowed size of 100 MB (${(body.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB).` },
            400,
            request,
            env
          );
        }

        // Validate Content-Type
        if (body.contentType && body.contentType !== "application/pdf") {
          return jsonResponse({ error: "Invalid Content-Type. Only application/pdf is permitted." }, 400, request, env);
        }

        // Validate and sanitize path to prevent path traversal
        let objectKey: string;
        try {
          const pathInfo = sanitizeUploadPath(body.filename, body.year, body.month);
          objectKey = pathInfo.objectKey;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Validation failed";
          return jsonResponse({ error: msg }, 400, request, env);
        }

        // Generate Presigned PUT URL
        try {
          const presigned = await generateR2PresignedPutUrl(env, objectKey, 900); // 15 min expiry
          return jsonResponse(
            {
              success: true,
              message: "Presigned upload URL generated successfully.",
              uploadUrl: presigned.uploadUrl,
              objectKey: presigned.objectKey,
              publicPdfUrl: presigned.publicPdfUrl,
              expiresInSeconds: presigned.expiresInSeconds,
              requiredHeaders: {
                "Content-Type": "application/pdf",
              },
            },
            200,
            request,
            env
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to generate presigned upload URL";
          return jsonResponse({ error: msg }, 500, request, env);
        }
      }

      // 5. Complete Upload & Update Catalogue
      if (pathname === "/api/upload/complete" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }

        const body = (await request.json().catch(() => null)) as UploadCompletePayload | null;
        if (!body || !body.objectKey) {
          return jsonResponse({ error: "Missing required objectKey." }, 400, request, env);
        }

        // Ensure objectKey cannot point outside newspapers/
        if (!body.objectKey.startsWith("newspapers/") || body.objectKey.includes("..")) {
          return jsonResponse({ error: "Invalid objectKey path." }, 400, request, env);
        }

        try {
          const { item, totalItems } = await addUploadedNewspaperToCatalogue(env, body, auth.user.uid);
          return jsonResponse(
            {
              success: true,
              message: "Newspaper published and catalogue updated in R2 successfully.",
              item,
              totalItems,
            },
            200,
            request,
            env
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to finalize upload.";
          return jsonResponse({ error: msg }, 400, request, env);
        }
      }

      // 6. Delete Edition & PDF
      if (pathname.startsWith("/api/catalogue/") && request.method === "DELETE") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }

        const editionId = pathname.replace("/api/catalogue/", "").trim();
        if (!editionId) {
          return jsonResponse({ error: "Missing edition ID." }, 400, request, env);
        }

        try {
          const { deletedItem, totalRemaining } = await deleteNewspaperFromR2(env, editionId);
          if (!deletedItem) {
            return jsonResponse({ error: `Edition "${editionId}" not found.` }, 404, request, env);
          }

          return jsonResponse(
            {
              success: true,
              message: `Edition "${deletedItem.title}" and its PDF have been permanently deleted from R2.`,
              deletedId: editionId,
              totalRemaining,
            },
            200,
            request,
            env
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to delete edition.";
          return jsonResponse({ error: msg }, 500, request, env);
        }
      }

      // 7. Update Edition Metadata (Status / Title)
      if (pathname.startsWith("/api/catalogue/") && request.method === "PATCH") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }

        const editionId = pathname.replace("/api/catalogue/", "").trim();
        const updates = ((await request.json().catch(() => ({}))) || {}) as Record<string, unknown>;

        const catalogue = await getCatalogueFromR2(env);
        const index = catalogue.findIndex((item) => item.id === editionId);

        if (index === -1) {
          return jsonResponse({ error: `Edition "${editionId}" not found.` }, 404, request, env);
        }

        const existing = catalogue[index];
        const updatedItem = {
          ...existing,
          ...updates,
          id: existing.id, // prevent id change
          objectKey: existing.objectKey, // prevent objectKey change
          pdfUrl: existing.pdfUrl,
          updatedAt: new Date().toISOString(),
        };

        catalogue[index] = updatedItem;
        await saveCatalogueToR2(env, catalogue);

        return jsonResponse(
          {
            success: true,
            message: "Edition updated successfully in R2.",
            item: updatedItem,
          },
          200,
          request,
          env
        );
      }

      // ─── WEBAUTHN / PASSKEY ENDPOINTS ───────────────────────────────

      // 8. WebAuthn Register Options
      if (pathname === "/api/webauthn/register/options" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const body = await request.json().catch(() => ({}));
        const result = await handleRegisterOptions(body as any, auth.user, env);
        // Merge CORS headers
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 9. WebAuthn Register Verify
      if (pathname === "/api/webauthn/register/verify" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const body = await request.json().catch(() => ({}));
        const result = await handleRegisterVerify(body as any, auth.user, env);
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 10. WebAuthn Authenticate Options
      if (pathname === "/api/webauthn/authenticate/options" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const body = await request.json().catch(() => ({}));
        const result = await handleAuthenticateOptions(body as any, auth.user, env);
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 11. WebAuthn Authenticate Verify
      if (pathname === "/api/webauthn/authenticate/verify" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const body = await request.json().catch(() => ({}));
        const result = await handleAuthenticateVerify(body as any, auth.user, env);
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 12. WebAuthn List Credentials
      if (pathname === "/api/webauthn/credentials" && request.method === "GET") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const uid = new URL(request.url).searchParams.get("uid") || auth.user.uid;
        const result = await handleListCredentials(uid, auth.user, env);
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 13. WebAuthn Delete Credential
      if (pathname === "/api/webauthn/credentials/delete" && request.method === "POST") {
        const auth = await authenticateAdmin(request, env);
        if (!auth.success) {
          return jsonResponse({ error: auth.error }, auth.statusCode, request, env);
        }
        const body = await request.json().catch(() => ({}));
        const result = await handleDeleteCredential(body as any, auth.user, env);
        const data = await result.json();
        return jsonResponse(data, result.status, request, env);
      }

      // 404 Not Found
      return jsonResponse({ error: `Endpoint "${request.method} ${pathname}" not found.` }, 404, request, env);
    } catch (err: unknown) {
      console.error("Unhandled Worker error:", err);
      const msg = err instanceof Error ? err.message : "Internal Server Error";
      return jsonResponse({ error: msg }, 500, request, env);
    }
  },
};
