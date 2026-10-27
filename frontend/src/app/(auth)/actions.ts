"use server";

import { authCredentialsSchema } from "./schemas/auth.schema";
import { login } from "@/services/auth/auth.service";
import {
  clearMockSession,
  createMockSession,
} from "@/services/auth/mock-session.server";

export async function loginWithMockSession(credentials: {
  email: string;
  password: string;
}) {
  const validation = authCredentialsSchema.safeParse(credentials);
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message ?? "Credenciales inválidas.");
  }

  const user = await login(validation.data);
  await createMockSession();
  return user;
}

export async function logoutMockSession(): Promise<void> {
  await clearMockSession();
}