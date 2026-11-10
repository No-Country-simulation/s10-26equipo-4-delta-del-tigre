import type { AuthCredentials, AuthResponse } from "@/types/auth.types";


const MOCK_USER = {
  id: "user-001",
  email: "demo@hostflow.com",
  password: "hostflow123",
  name: "Administrador",
};

export async function mockLogin(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const email = credentials.email.trim().toLowerCase();

  if (
    email !== MOCK_USER.email ||
    credentials.password !== MOCK_USER.password
  ) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  return {
    user: {
      id: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
    },
  };
}
