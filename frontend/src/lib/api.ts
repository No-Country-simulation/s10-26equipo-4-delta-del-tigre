export type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;
  readonly payload: unknown;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    payload: unknown = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.payload = payload;
  }
}

export function getApiBaseUrl(): string {
  const raw =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    throw new ApiError(
      "La API no está configurada. Definí NEXT_PUBLIC_API_URL.",
      0,
    );
  }

  const normalized = raw.replace(/\/+$/, "");

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL debe ser una URL completa con http:// o https://.",
      0,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL debe usar http:// o https://.",
      0,
    );
  }

  return normalized;
}

function toFieldErrors(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const errors: Record<string, string> = {};
  for (const [field, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      errors[field] = entry;
    } else if (Array.isArray(entry)) {
      const first = entry.find((item) => typeof item === "string");
      if (typeof first === "string") errors[field] = first;
    }
  }
  return errors;
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Record<string, unknown>).data;
  }
  return payload;
}

type ApiRequestInit = Omit<RequestInit, "cache"> & {
  token?: string;
  cache?: RequestCache;
};

export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const { token, headers: rawHeaders, ...rest } = init;
  const baseUrl = getApiBaseUrl();

  const headers = new Headers(rawHeaders);
  headers.set("Accept", "application/json");
  if (rest.body !== undefined && !(rest.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...rest,
      headers,
      cache: init.cache ?? "no-store",
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const message =
      typeof body?.message === "string" && body.message.trim()
        ? body.message
        : `La operación falló (${response.status}).`;

    throw new ApiError(
      message,
      response.status,
      toFieldErrors(body?.data),
      payload,
    );
  }

  return unwrapData(payload) as T;
}
