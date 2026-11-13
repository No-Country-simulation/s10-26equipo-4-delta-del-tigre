import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Link2,
  MapPin,
  Ship,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HostFlow — Menos gestión. Más bienvenida.",
  description:
    "Centralizá reservas, check-in y traslados de tu complejo en el Delta del Tigre.",
};

const pasos = [
  {
    titulo: "Compartí el link de tu complejo",
    detalle:
      "Cada complejo tiene su propio onboarding público. Enviáselo a tu huésped y listo.",
  },
  {
    titulo: "El huésped completa sus datos",
    detalle:
      "Documento, horario de llegada y traslados en un formulario simple, desde el celular.",
  },
  {
    titulo: "Vos gestionás desde un panel",
    detalle:
      "Reservas, pagos y próximos arribos actualizados en tiempo real.",
  },
];

const beneficios = [
  {
    icono: CalendarCheck,
    titulo: "Check-in sin fricción",
    detalle:
      "Menos mensajes ida y vuelta. La información llega ordenada antes de que el huésped toque el muelle.",
  },
  {
    icono: Ship,
    titulo: "Traslados y experiencias",
    detalle:
      "Lancha remis, desayunos y adicionales coordinados desde el mismo lugar.",
  },
  {
    icono: Sparkles,
    titulo: "Tu complejo, más profesional",
    detalle:
      "Una experiencia de bienvenida a la altura del Delta, sin planillas sueltas.",
  },
];

function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const light = variant === "light";

  return (
    <Link href="/" className="flex items-center gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          light
            ? "bg-[#f7f5ee] text-[#124237]"
            : "bg-[#124237] text-[#d9efe3]"
        }`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 9c2.4-1.9 4.9-1.9 7.3 0 2.4 1.9 4.9 1.9 8.7 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M4 14.5c2.4-1.9 4.9-1.9 7.3 0 2.4 1.9 4.9 1.9 8.7 0"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={`text-xl font-semibold tracking-tight ${
          light ? "text-[#f7f5ee]" : "text-[#143f33]"
        }`}
      >
        HostFlow
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="flex-1 bg-[#f7f5ee] font-sans text-[#172c28]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#4f6158] md:flex">
          <a
            href="#como-funciona"
            className="transition-colors hover:text-[#143f33]"
          >
            Cómo funciona
          </a>
          <a
            href="#beneficios"
            className="transition-colors hover:text-[#143f33]"
          >
            Beneficios
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#143f33] transition-colors hover:bg-[#143f33]/5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[#124237] px-4 py-2.5 text-sm font-semibold text-[#f7f5ee] shadow-sm transition-colors hover:bg-[#0d332a]"
          >
            Registrarse
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-12">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#2e6a78]">
            Hospitalidad conectada al Delta
          </p>

          <h1 className="text-balance text-[clamp(2.9rem,6.2vw,5rem)] font-medium leading-[0.98] tracking-[-0.045em] text-[#143f33]">
            <span className="block">Menos gestión.</span>
            <span className="block text-[#2e6a78]">Más</span>
            <span className="block text-[#2e6a78]">bienvenida.</span>
          </h1>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-[#5d6d65]">
            Centralizá reservas, check-in y traslados en un solo lugar. Tus
            huéspedes llegan, vos disfrutás del río.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#124237] px-6 text-sm font-semibold text-[#f7f5ee] shadow-sm transition-colors hover:bg-[#0d332a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#124237]"
            >
              Empezar ahora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/onboarding/refugio-del-rio"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#cfd8d1] bg-white/70 px-6 text-sm font-semibold text-[#143f33] transition-colors hover:border-[#143f33]/30 hover:bg-white"
            >
              Ver experiencia huésped
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[
                { iniciales: "IR", clase: "bg-[#2e6a78]" },
                { iniciales: "AD", clase: "bg-[#c98b5e]" },
                { iniciales: "NC", clase: "bg-[#8aa38f]" },
              ].map((persona) => (
                <span
                  key={persona.iniciales}
                  className={`grid size-9 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-[#f7f5ee] ${persona.clase}`}
                >
                  {persona.iniciales}
                </span>
              ))}
            </div>
            <p className="max-w-[220px] text-sm leading-snug text-[#5d6d65]">
              <span className="font-semibold text-[#143f33]">
                Complejos del Delta
              </span>{" "}
              ya reciben mejor a sus huéspedes.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px]">
          <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2rem] rounded-tl-[6rem] shadow-[0_30px_80px_-40px_rgba(20,63,51,0.55)]">
            <Image
              src="/fondos/bg-image.png"
              alt="Casa sobre el río en el Delta del Tigre"
              fill
              priority
              sizes="(min-width: 1024px) 520px, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a24]/75 via-[#0d2a24]/5 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Próximo arribo
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-lg font-medium text-white">
                <MapPin className="size-4 text-white/80" aria-hidden="true" />
                Arroyo Espera · 14:00
              </p>
            </div>
          </div>

          <div className="absolute -left-2 top-6 w-[230px] rounded-2xl bg-white p-4 shadow-[0_18px_45px_-20px_rgba(20,63,51,0.45)] sm:-left-6 sm:top-10 lg:-left-12 lg:top-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2e6a78]">
              Check-in completado
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8efe9] text-xs font-semibold text-[#143f33]">
                ML
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#143f33]">
                  Marina López
                </p>
                <p className="truncate text-xs text-[#71817b]">
                  2 huéspedes · 3 noches
                </p>
              </div>
              <span className="ml-auto grid size-6 shrink-0 place-items-center rounded-full bg-[#2e6a78] text-white">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="absolute -right-2 bottom-24 w-[200px] rounded-2xl bg-white p-4 shadow-[0_18px_45px_-20px_rgba(20,63,51,0.45)] sm:-right-6 sm:bottom-28 lg:-right-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e7f0f4] text-[#2e6a78]">
                <Ship className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2e6a78]">
                  Lancha remis
                </p>
                <p className="truncate text-xs font-medium text-[#143f33]">
                  Cotización solicitada
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-t border-[#e4e0d6] bg-[#f3f0e8]"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2e6a78]">
              Cómo funciona
            </p>
            <h2 className="mt-4 text-balance text-3xl font-medium tracking-[-0.03em] text-[#143f33] sm:text-4xl">
              La llegada perfecta, sin planillas.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#5d6d65]">
              De la reserva a la bienvenida en el muelle, todo en un mismo
              flujo.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {pasos.map((paso, indice) => (
              <article
                key={paso.titulo}
                className="rounded-2xl border border-[#e0dad0] bg-[#fbfaf6] p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#143f33] text-sm font-semibold text-[#f7f5ee]">
                  {indice + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#143f33]">
                  {paso.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5d6d65]">
                  {paso.detalle}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-t border-[#e4e0d6]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2e6a78]">
              Beneficios
            </p>
            <h2 className="mt-4 text-balance text-3xl font-medium tracking-[-0.03em] text-[#143f33] sm:text-4xl">
              Más tiempo en el río, menos tiempo en el escritorio.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {beneficios.map((beneficio) => {
              const Icono = beneficio.icono;

              return (
                <article
                  key={beneficio.titulo}
                  className="rounded-2xl border border-[#e0dad0] bg-white/60 p-6"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[#e7f0f4] text-[#2e6a78]">
                    <Icono className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#143f33]">
                    {beneficio.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5d6d65]">
                    {beneficio.detalle}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-[#124237] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#d9efe3]">
                <Link2 className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold text-[#f7f5ee]">
                  Un link. Toda la bienvenida.
                </p>
                <p className="mt-1 text-sm text-[#c7d9d0]">
                  Probalo con un complejo real del Delta.
                </p>
              </div>
            </div>
            <Link
              href="/onboarding/brisas-del-parana"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f7f5ee] px-5 text-sm font-semibold text-[#124237] transition-colors hover:bg-white"
            >
              Ver onboarding demo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0d332a] bg-[#143f33]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <Logo variant="light" />
            <p className="mt-3 text-sm text-[#a9c2b6]">
              Hospitalidad simple para el Delta del Tigre.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#c7d9d0]">
            <a href="#como-funciona" className="hover:text-white">
              Cómo funciona
            </a>
            <a href="#beneficios" className="hover:text-white">
              Beneficios
            </a>
            <Link href="/login" className="hover:text-white">
              Iniciar sesión
            </Link>
            <Link
              href="/onboarding/refugio-del-rio"
              className="hover:text-white"
            >
              Experiencia huésped
            </Link>
          </nav>
        </div>

        <div className="mx-auto w-full max-w-6xl border-t border-white/10 px-6 py-5 text-xs text-[#8fae9f] lg:px-8">
          © 2026 HostFlow · Delta del Tigre, Argentina
        </div>
      </footer>
    </main>
  );
}
