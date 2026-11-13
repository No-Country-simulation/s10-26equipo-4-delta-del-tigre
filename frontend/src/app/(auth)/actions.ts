"use server";

import { ApiError } from "@/lib/api";
import { loginRequest, logoutRequest, registerRequest } from "@/services/auth/auth.service";
import {
  createSession,
  destroySession,
  getSessionToken,
} from "@/services/auth/session";
import type { AuthCredentials, RegisterData } from "@/types/auth.types";
import { authSchema, authCredentialsSchema } from "./schemas/auth.schema";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function toResult(error: unknown): AuthActionResult {
  if (error instanceof ApiError) {
    const fieldErrors = Object.keys(error.fieldErrors).length
      ? error.fieldErrors
      : undefined;
    return { ok: false, message: error.message, fieldErrors };
  }

  return {
    ok: false,
    message:
      "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
  };
}

export async function loginAction(
  credentials: AuthCredentials,
): Promise<AuthActionResult> {
  const validation = authCredentialsSchema.safeParse(credentials);
  if (!validation.success) {
    return {
      ok: false,
      message:
        validation.error.issues[0]?.message ?? "Credenciales inválidas.",
    };
  }

  try {
    const session = await loginRequest(validation.data);
    await createSession(session.accessToken, session.expiresIn);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function registerAction(
  data: RegisterData,
): Promise<AuthActionResult> {
  const validation = authSchema.safeParse({
    ...data,
    "confirm-password": data.password,
  });

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }

    return {
      ok: false,
      message:
        validation.error.issues[0]?.message ?? "Revisá los datos ingresados.",
      fieldErrors,
    };
  }

  try {
    const session = await registerRequest({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
    });
    await createSession(session.accessToken, session.expiresIn);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function logoutAction(): Promise<void> {
  const token = await getSessionToken();

  if (token) {
    try {
      await logoutRequest(token);
    } catch {
      // El backend es stateless: si falla, igual cerramos la sesión local.
    }
  }

  await destroySession();
}
