"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="mb-3 mt-1 text-sm text-[#ffb7a8]" role="alert">
      {message}
    </p>
  ) : null;
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
      >
        {/* Silueta de casa */}
        <path
          d="M9 29 28.7 12.8a5.2 5.2 0 0 1 6.6 0L55 29"
          stroke="#B8F2D8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 27.5V45a6 6 0 0 0 6 6h2"
          stroke="#B8F2D8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M49 37v8a6 6 0 0 1-6 6h-2"
          stroke="#B8F2D8"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hoja */}
        <g transform="translate(15.75 15.5) scale(0.092)">
          <path
            d="M94.766 362.304 77.063 408.634 57.141 415.068 92.94 320.726C104.168 311.99 84.14 281.687 109.015 214.28 133.89 146.873 209.115 118.268 316.231 94.672 377.653 81.142 414.56 54.133 431.391 38.892 448.222 23.651 412.711 208.738 379.173 248.075 345.635 287.412 287.903 362.912 174.94 362.556 61.977 362.2 96.391 361.387 96.347 361.377Z"
            fill="#55D6A5"
          />
          <path
            d="M105 350C174 278 239 231 310 195"
            fill="none"
            stroke="#E9FFF5"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="text-[27px] font-medium tracking-tight">hostflow</span>
    </div>
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
    <section
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-cover bg-center px-5 py-3 sm:px-10 sm:py-4 lg:px-14 lg:py-6"
      style={{
        backgroundImage:
          "linear-gradient(110deg, rgba(7, 24, 22, 0.74), rgba(7, 24, 22, 0.52)), url('/fondos/bg-image.png')",
      }}
    >
      <div className="relative grid w-full max-w-6xl items-center gap-6 md:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
        <div className="hidden max-w-xl text-white md:block">
          <BrandLogo />
          <p className="mb-4 mt-12 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a9e4cb]">
            Tu alojamiento, más simple
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] lg:text-[46px]">
            Gestioná tus complejos y brindá mejores{" "}
            <span className="text-[#68d2a6]">experiencias</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
            HostFlow te ayuda a administrar tus alojamientos, reservas y
            servicios para que tus huéspedes disfruten de un proceso de
            bienvenida simple.
          </p>
          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-[#76d9b1]">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <strong className="block font-medium">
                  Gestioná tus complejos
                </strong>
                <span className="mt-1 block text-white/65">
                  Todo en un solo lugar.
                </span>
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-[#76d9b1]">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path
                    d="M16 3v4M8 3v4M3 10h18m-13 4h2m4 0h2m-8 4h2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <strong className="block font-medium">
                  Administrá tus reservas
                </strong>
                <span className="mt-1 block text-white/65">
                  De forma fácil y organizada.
                </span>
              </span>
            </li>
            <li className="flex items-center gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-[#76d9b1]">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-2a8 8 0 0 1 16 0v2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <strong className="block font-medium">
                  Ofrecé una mejor experiencia
                </strong>
                <span className="mt-1 block text-white/65">
                  A tus huéspedes.
                </span>
              </span>
            </li>
          </ul>
        </div>
        <form
          className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-[#70cba6]/55 bg-[#102a28]/80 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mb-4 sm:mb-5">
            <BrandLogo />
            <h2 className="mt-4 text-2xl font-semibold">Creá tu cuenta</h2>
            <p className="mt-1 text-sm leading-5 text-white/70">
              Ingresá tus datos para empezar a gestionar tu alojamiento.
            </p>
          </div>
          {formErrors.length > 0 && (
            <div
              className="mb-5 rounded-md border border-red-300/30 bg-red-950/50 px-4 py-3 text-sm text-[#ffd0c7]"
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
              className="mb-5 rounded-md border border-[#77d8b1]/30 bg-[#15533f]/50 px-4 py-3 text-sm text-[#b9f1d7]"
              role="status"
            >
              {successMessage}
            </p>
          )}
          <label
            className="mb-2 text-sm font-medium text-white/90"
            htmlFor="name"
          >
            Nombre completo
          </label>
          <input
            className="h-10 rounded-md border border-white/20 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[#69d2a7] focus:ring-4 focus:ring-[#69d2a7]/15"
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
            className="mb-2 text-sm font-medium text-white/90"
            htmlFor="email"
          >
            Correo electrónico
          </label>
          <input
            className="h-10 rounded-md border border-white/20 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[#69d2a7] focus:ring-4 focus:ring-[#69d2a7]/15"
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
            className="mb-2 text-sm font-medium text-white/90"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            className="h-10 rounded-md border border-white/20 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[#69d2a7] focus:ring-4 focus:ring-[#69d2a7]/15"
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
            className="mb-2 text-sm font-medium text-white/90"
            htmlFor="confirm-password"
          >
            Confirmar contraseña
          </label>
          <input
            className="h-10 rounded-md border border-white/20 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[#69d2a7] focus:ring-4 focus:ring-[#69d2a7]/15"
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
          <a href="/login" className="text-sm text-[#9fe4c4] hover:underline">
            ¿Ya tenés una cuenta? Iniciá sesión
          </a>
          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="mt-4 h-11 rounded-md bg-linear-to-r from-[#54bd91] to-[#36a77d] px-4 text-sm font-semibold text-[#06261c] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce0b7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102a28]"
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
