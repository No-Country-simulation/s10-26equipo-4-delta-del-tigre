"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mb-5 mt-1 text-sm text-red-700" role="alert">
      {message}
    </p>
  ) : (
    <div className="mb-5" />
  );
}

function extractBackendErrors(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];

  const data = payload as Record<string, unknown>;
  const validation = data.errors ?? data.fieldErrors;
  const messages: string[] = [];

  if (Array.isArray(validation)) {
    for (const entry of validation) {
      if (typeof entry === "string") {
        messages.push(entry);
      } else if (entry && typeof entry === "object") {
        const error = entry as Record<string, unknown>;
        const message = error.message ?? error.defaultMessage ?? error.detail;
        const field = error.field ?? error.name;
        if (typeof message === "string") {
          messages.push(
            typeof field === "string" ? `${field}: ${message}` : message,
          );
        }
      }
    }
  } else if (validation && typeof validation === "object") {
    for (const [field, value] of Object.entries(validation)) {
      const fieldMessages = Array.isArray(value) ? value : [value];
      for (const message of fieldMessages) {
        if (typeof message === "string") {
          messages.push(`${field}: ${message}`);
        }
      }
    }
  }

  const metadataFields = new Set([
    "timestamp",
    "status",
    "error",
    "path",
    "type",
    "instance",
    "title",
    "detail",
    "message",
    "errors",
    "fieldErrors",
  ]);
  for (const [field, value] of Object.entries(data)) {
    if (metadataFields.has(field)) continue;
    const fieldMessages = Array.isArray(value) ? value : [value];
    for (const message of fieldMessages) {
      if (typeof message === "string") {
        messages.push(`${field}: ${message}`);
      }
    }
  }

  for (const key of ["message", "detail", "title", "error"]) {
    if (typeof data[key] === "string") messages.push(data[key] as string);
  }

  return [...new Set(messages)];
}

function getRedirectPath(payload: unknown) {
  if (!payload || typeof payload !== "object") return "/login";

  const redirectTo = (payload as Record<string, unknown>).redirectTo;
  if (typeof redirectTo !== "string" || !redirectTo.trim()) return "/login";

  try {
    const url = new URL(redirectTo, window.location.origin);
    if (url.origin !== window.location.origin) return "/login";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/login";
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors([]);
    setFieldErrors({});
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");
    const validationErrors: Record<string, string> = {};

    if (!name) validationErrors.name = "Ingresá tu nombre.";
    if (!validateEmail(email)) {
      validationErrors.email = "Ingresá un correo electrónico válido.";
    }
    if (password.length < 8) {
      validationErrors.password =
        "La contraseña debe tener al menos 8 caracteres.";
    }
    if (password !== confirmPassword) {
      validationErrors["confirm-password"] = "Las contraseñas no coinciden.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!apiUrl) {
      setFormErrors([
        "La API no está configurada. Definí NEXT_PUBLIC_API_URL para continuar.",
      ]);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const backendErrors = extractBackendErrors(payload);
        const nextFieldErrors: Record<string, string> = {};
        const generalErrors: string[] = [];
        const backendFieldNames: Record<string, string> = {
          name: "name",
          fullname: "name",
          email: "email",
          password: "password",
          "confirm-password": "confirm-password",
          confirmpassword: "confirm-password",
          confirm_password: "confirm-password",
        };

        for (const error of backendErrors) {
          const separatorIndex = error.indexOf(":");
          const field = error.slice(0, separatorIndex).trim().toLowerCase();
          const message = error.slice(separatorIndex + 1).trim();
          const fieldName = backendFieldNames[field];

          if (separatorIndex > 0 && fieldName && message) {
            nextFieldErrors[fieldName] = message;
          } else {
            generalErrors.push(error);
          }
        }

        setFieldErrors(nextFieldErrors);
        setFormErrors(
          generalErrors.length > 0
            ? generalErrors
            : backendErrors.length > 0
              ? []
              : [`No se pudo completar el registro (${response.status}).`],
        );
        return;
      }

      setSuccessMessage("Registro exitoso. Redirigiendo...");
      window.setTimeout(() => router.replace(getRedirectPath(payload)), 800);
    } catch {
      setFormErrors([
        "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16 ">
      <div className="flex w-full max-w-sm flex-col m-3 ">
        <form
          className="flex w-full max-w-sm flex-col bg-amber-50 rounded-lg p-6 shadow-md"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mb-8 text-center">
            <h2 className="mt-2 text-2xl font-semibold text-[#1c2b24]">
              Registrate
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6e7972]">
              Ingresá tus datos para crear tu cuenta.
            </p>
          </div>
          {formErrors.length > 0 && (
            <div
              className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              <ul className="list-inside list-disc space-y-1">
                {formErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {successMessage && (
            <p
              className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              role="status"
            >
              {successMessage}
            </p>
          )}
          <label
            className="mb-2 text-sm font-medium text-[#293a31]"
            htmlFor="name"
          >
            Nombre completo
          </label>
          <input
            className="h-12 rounded-md border border-[#d5ddd5] bg-[#fbfcfa] px-4 text-sm text-[#1c2b24] outline-none transition placeholder:text-[#929c95] focus:border-[#3e7056] focus:ring-4 focus:ring-[#3e7056]/10"
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Tu nombre"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            required
          />
          <FieldError id="name-error" message={fieldErrors.name} />
          <label
            className="mb-2 text-sm font-medium text-[#293a31]"
            htmlFor="email"
          >
            Correo electrónico
          </label>
          <input
            className="h-12 rounded-md border border-[#d5ddd5] bg-[#fbfcfa] px-4 text-sm text-[#1c2b24] outline-none transition placeholder:text-[#929c95] focus:border-[#3e7056] focus:ring-4 focus:ring-[#3e7056]/10"
            type="email"
            id="email"
            name="email"
            autoComplete="off"
            placeholder="tu@email.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            required
          />
          <FieldError id="email-error" message={fieldErrors.email} />
          <label
            className="mb-2 text-sm font-medium text-[#293a31]"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            className="h-12 rounded-md border border-[#d5ddd5] bg-[#fbfcfa] px-4 text-sm text-[#1c2b24] outline-none transition placeholder:text-[#929c95] focus:border-[#3e7056] focus:ring-4 focus:ring-[#3e7056]/10"
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="********"
            minLength={8}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            required
          />
          <FieldError id="password-error" message={fieldErrors.password} />
          <label
            className="mb-2 text-sm font-medium text-[#293a31]"
            htmlFor="confirm-password"
          >
            Confirmar contraseña
          </label>
          <input
            className="h-12 rounded-md border border-[#d5ddd5] bg-[#fbfcfa] px-4 text-sm text-[#1c2b24] outline-none transition placeholder:text-[#929c95] focus:border-[#3e7056] focus:ring-4 focus:ring-[#3e7056]/10"
            type="password"
            id="confirm-password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="********"
            aria-invalid={Boolean(fieldErrors["confirm-password"])}
            aria-describedby={
              fieldErrors["confirm-password"]
                ? "confirm-password-error"
                : undefined
            }
            required
          />
          <FieldError
            id="confirm-password-error"
            message={fieldErrors["confirm-password"]}
          />
          <a href="/login" className="text-sm text-[#3e7056] hover:underline">
            ¿Ya tienes una cuenta? Inicia sesión
          </a>
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="mt-6 h-12 rounded-md bg-[#3e7056] px-4 text-sm font-semibold text-white transition hover:bg-[#2c4f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e7056] focus-visible:ring-offset-2"
          >
            {isSubmitting
              ? "Registrando..."
              : successMessage
                ? "Registro exitoso"
                : "Registrarse"}
          </button>
        </form>
      </div>
    </section>
  );
}
