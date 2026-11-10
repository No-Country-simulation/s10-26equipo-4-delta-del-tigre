"use client";

import { Suspense, useState, useEffect, type FormEvent, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authCredentialsSchema } from "../schemas/auth.schema";
import { loginWithMockSession } from "../actions";
import Unauthorized from "../../unauthorized";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mb-3 mt-1 text-sm text-[#ffb7a8]" role="alert">
      {message}
    </p>
  );
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-dvh bg-[#f5f8f6]" aria-busy="true" />}
    >
      <LoginRouteContent />
    </Suspense>
  );
}

function LoginRouteContent() {
  const searchParams = useSearchParams();

  if (searchParams.get("session") === "expired") {
    return <Unauthorized />;
  }

  return <LoginForm />;
}

function LoginForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null)


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormErrors([]);
    setFieldErrors({});
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);

    const validation = authCredentialsSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};

      for (const issue of validation.error.issues) {
        const field = String(issue.path[0] ?? "");

        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await loginWithMockSession(validation.data);

      setSuccessMessage("Inicio de sesión exitoso. Redirigiendo...");

      window.setTimeout(() => {
        router.replace("/dashboard");
      }, 600);
    } catch (error) {
      setFormErrors([
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

 useEffect(() => {
  formRef.current?.reset();
}, []);

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
          ref={formRef}
          className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-[#70cba6]/55 bg-[#102a28]/80 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6"
          onSubmit={handleSubmit}
          autoComplete="on"
          noValidate
        >
          <div className="mb-4 sm:mb-5">
            <BrandLogo />

            <h2 className="mt-4 text-2xl font-semibold">Iniciar sesión</h2>

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
            htmlFor="email"
          >
            Correo electrónico
          </label>

          <input
            className={`h-10 rounded-md border bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:ring-4 ${
              fieldErrors.email
                ? "border-red-400 focus:border-red-400 focus:ring-red-400/15"
                : "border-white/20 focus:border-[#69d2a7] focus:ring-[#69d2a7]/15"
            }`}
            type="email"
            id="email"
            name="email"
            autoComplete="username"
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

          <div className="relative">
            <input
              className={`h-10 w-full rounded-md border bg-white/[0.07] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/45 focus:ring-4 ${
                fieldErrors.password
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/15"
                  : "border-white/20 focus:border-[#69d2a7] focus:ring-[#69d2a7]/15"
              }`}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="********"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password ? "password-error" : undefined
              }
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7ce0b7]"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <FieldError id="password-error" message={fieldErrors.password} />

          <a
            href="/register"
            className="text-sm text-[#9fe4c4] hover:underline"
          >
            ¿No tenés cuenta? Registrate aquí
          </a>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="mt-4 h-11 rounded-md bg-linear-to-r from-[#54bd91] to-[#36a77d] px-4 text-sm font-semibold text-[#06261c] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ce0b7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#102a28] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Ingresando..."
              : successMessage
                ? "Sesión iniciada"
                : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </section>
  );
}
