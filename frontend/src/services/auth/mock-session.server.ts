import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

const SESSION_COOKIE = "hostflow_mock_session";
const SESSION_DURATION_SECONDS = 30 * 60;
const activeSessions = new Map<string, number>();

export async function createMockSession(): Promise<void> {
  const sessionId = randomUUID();
  activeSessions.set(
    sessionId,
    Date.now() + SESSION_DURATION_SECONDS * 1000,
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function hasMockSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return false;

  await connection();

  const expiresAt = activeSessions.get(sessionId);
  if (!expiresAt || expiresAt <= Date.now()) {
    activeSessions.delete(sessionId);
    return false;
  }

  return true;
}

export async function clearMockSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) activeSessions.delete(sessionId);

  cookieStore.delete(SESSION_COOKIE);
}
