import { apiRequest } from "@/lib/api";
import type {
  AuthCredentials,
  AuthToken,
  AuthUser,
  RegisterData,
} from "@/types/auth.types";

export function loginRequest(credentials: AuthCredentials): Promise<AuthToken> {
  return apiRequest<AuthToken>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function registerRequest(data: RegisterData): Promise<AuthToken> {
  return apiRequest<AuthToken>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
  });
}

export function fetchMe(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/auth/me", { token });
}

export async function logoutRequest(token: string): Promise<void> {
  await apiRequest<null>("/api/auth/logout", {
    method: "POST",
    token,
  });
}
