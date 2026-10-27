import { mockLogin } from "@/mocks/auth.mock";
import type { AuthCredentials, AuthResponse } from "@/types/auth.types";

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  return mockLogin(credentials);
}
