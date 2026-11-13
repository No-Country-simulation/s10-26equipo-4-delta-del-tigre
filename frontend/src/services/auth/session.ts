import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { fetchMe } from "@/services/auth/auth.service";
import type { AuthUser } from "@/types/auth.types";

const SESSION_COOKIE = "hostflow_session";
const FALLBACK_DURATION_SECONDS = 30 * 60;

export async function createSession(
  accessToken: string,
  expiresIn: number,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge:
      Number.isFinite(expiresIn) && expiresIn > 0
        ? Math.floor(expiresIn)
        : FALLBACK_DURATION_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function hasSession(): Promise<boolean> {
  return Boolean(await getSessionToken());
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await fetchMe(token);
  } catch {
    return null;
  }
});
