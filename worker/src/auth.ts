import { createRemoteJWKSet, jwtVerify } from "jose";
import { Env, AuthResult } from "./types";

// Firebase Auth public key JWKS endpoint (automatically handles key rotation)
const FIREBASE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
);

// Cache JWKS in memory for Cloudflare Worker instance
const remoteJWKSet = createRemoteJWKSet(FIREBASE_JWKS_URL);

/**
 * Verify Firebase ID Token and check if the UID is authorized as an Admin.
 *
 * Requirements enforced:
 * 1. Missing or malformed Bearer token -> 401 Unauthorized
 * 2. Signature verification with Google's public JWKS -> 401 Unauthorized
 * 3. Issuer: https://securetoken.google.com/<FIREBASE_PROJECT_ID> -> 401 Unauthorized
 * 4. Audience: <FIREBASE_PROJECT_ID> -> 401 Unauthorized
 * 5. Expiration / Not before claims -> 401 Unauthorized
 * 6. Non-empty subject (UID) -> 401 Unauthorized
 * 7. UID must exist in ADMIN_UIDS allowlist -> 403 Forbidden
 */
export async function authenticateAdmin(
  request: Request,
  env: Env
): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      statusCode: 401,
      error: "Missing or invalid Authorization header. Expected 'Bearer <FIREBASE_ID_TOKEN>'",
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      success: false,
      statusCode: 401,
      error: "Empty Firebase ID token provided.",
    };
  }

  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return {
      success: false,
      statusCode: 401,
      error: "Server misconfiguration: FIREBASE_PROJECT_ID is not configured in Worker.",
    };
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  try {
    const { payload } = await jwtVerify(token, remoteJWKSet, {
      issuer: expectedIssuer,
      audience: projectId,
      algorithms: ["RS256"],
    });

    const uid = payload.sub;
    if (!uid || typeof uid !== "string") {
      return {
        success: false,
        statusCode: 401,
        error: "Invalid token: subject (uid) is missing.",
      };
    }

    // Verify auth_time is in the past
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.auth_time === "number" && payload.auth_time > now) {
      return {
        success: false,
        statusCode: 401,
        error: "Invalid token: auth_time is in the future.",
      };
    }

    // 2. Check Administrator Authorization (UID Allowlist)
    const rawAllowlist = env.ADMIN_UIDS || "";
    const allowedUids = rawAllowlist
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (allowedUids.length === 0) {
      return {
        success: false,
        statusCode: 403,
        error: "Forbidden: No administrator UIDs are configured on this server.",
      };
    }

    if (!allowedUids.includes(uid)) {
      return {
        success: false,
        statusCode: 403,
        error: "Forbidden: Your account is not authorized as an administrator.",
      };
    }

    return {
      success: true,
      user: {
        uid,
        email: typeof payload.email === "string" ? payload.email : undefined,
        name: typeof payload.name === "string" ? payload.name : undefined,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token verification failed";
    return {
      success: false,
      statusCode: 401,
      error: `Authentication failed: ${message}`,
    };
  }
}
