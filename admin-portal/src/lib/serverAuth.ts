import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const FIREBASE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
);

const remoteJWKSet = createRemoteJWKSet(FIREBASE_JWKS_URL);

export interface AuthenticatedAdmin {
  uid: string;
  email?: string;
  name?: string;
}

export async function authenticateAdminRequest(
  request: NextRequest | Request
): Promise<{ success: true; user: AuthenticatedAdmin } | { success: false; error: string; status: number }> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      status: 401,
      error: "Missing or invalid Authorization header.",
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      success: false,
      status: 401,
      error: "Empty token provided.",
    };
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    "nyaayagharjane-01";

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
        status: 401,
        error: "Invalid token: subject missing.",
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
    const msg = err instanceof Error ? err.message : "Token verification failed";
    return {
      success: false,
      status: 401,
      error: `Authentication failed: ${msg}`,
    };
  }
}
