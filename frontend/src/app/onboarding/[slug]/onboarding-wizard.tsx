"use client";

import Image from "next/image";
import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
    HeartHandshake,
    Ship,
    Sparkles,
    Users,
    type LucideIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import type { ComplejoPublico } from "@/services/onboarding/onboarding.service";
import {
    datosHuespedSchema,
    hoyISO,
    type DatosHuespedForm,
} from "./schemas/onboarding.schema";

type PasoConfig = {
    titulo: string;
    eyebrow: string;
    heading: string;
    icono: LucideIcon;
};

const PASOS: PasoConfig[] = [
    {
        titulo: "Tus datos",
        eyebrow: "Bienvenidos al Delta",
        heading: "Empecemos por conocerte",
        icono: Users,
    },
    {
        titulo: "Preferencias",
        eyebrow: "Contanos más",
        heading: "Preferencias y alergias",
        icono: HeartHandshake,
    },
    {
        titulo: "Adicionales",
        eyebrow: "Sumá servicios",
        heading: "¿Querés agregar algo?",
        icono: Sparkles,
    },
    {
        titulo: "Lancha remis",
        eyebrow: "Tu traslado",
        heading: "Coordinemos tu lancha",
        icono: Ship,
    },
];

const DATOS_INICIALES: DatosHuespedForm = {
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    huespedes: "2",
    llegada: "",
    salida: "",
};

const INPUT_CLASS =
    "h-12 rounded-xl border-[#e3ded2] bg-white px-3.5 text-sm text-[#172c28] shadow-none placeholder:text-[#9aa6a1] focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]";

function colorDeMarca(valor: string | null) {
    const color = valor?.split(",")[0]?.trim();
    return color && /^#[\da-f]{6}$/i.test(color) ? color : "#174f40";
}

function iniciales(nombre: string) {
    return nombre
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toLocaleUpperCase("es");
}

function Campo({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-1.5 block text-xs font-semibold text-[#172c28]"
            >
                {label}
            </label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-[#a33c2f]" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

export function OnboardingWizard({ complejo }: { complejo: ComplejoPublico }) {
    const colorMarca = colorDeMarca(complejo.coloresMarca);
    const [paso, setPaso] = useState(1);
    const [datos, setDatos] = useState<DatosHuespedForm>(DATOS_INICIALES);
    const [errores, setErrores] = useState<Record<string, string>>({});

    const pasoActual = PASOS[paso - 1];
    const Icono = pasoActual.icono;
    const hoy = hoyISO();
    const estiloMarca = { "--brand": colorMarca } as CSSProperties;

    function actualizar(campo: keyof DatosHuespedForm, valor: string) {
        setDatos((previos) => ({ ...previos, [campo]: valor }));
        setErrores((previos) => {
            if (!previos[campo]) return previos;
            const siguientes = { ...previos };
            delete siguientes[campo];
            return siguientes;
        });
    }

    function continuarPasoUno(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validacion = datosHuespedSchema.safeParse(datos);
        if (!validacion.success) {
            const siguientes: Record<string, string> = {};
            for (const issue of validacion.error.issues) {
                const campo = String(issue.path[0] ?? "");
                if (campo && !siguientes[campo]) siguientes[campo] = issue.message;
            }
            setErrores(siguientes);
            return;
        }

        setErrores({});
        setPaso(2);
    }

    function volver() {
        setPaso((actual) => Math.max(actual - 1, 1));
    }

    function siguiente() {
        setPaso((actual) => Math.min(actual + 1, PASOS.length));
    }

    return (
        <div
            style={estiloMarca}
            className="flex min-h-dvh flex-col bg-[#f7f4ec] text-[#172c28]"
        >
            <header className="border-b border-[#e8e3d7] bg-[#fbf9f4]">
                <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {complejo.logo ? (
                            <Image
                                src={complejo.logo}
                                alt={`Logo de ${complejo.nombre}`}
                                width={44}
                                height={44}
                                unoptimized
                                className="size-11 shrink-0 rounded-xl object-cover"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className="grid size-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
                                style={{ backgroundColor: colorMarca }}
                            >
                                {iniciales(complejo.nombre)}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-tight">
                                {complejo.nombre}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-[#7d8a84]">
                                {complejo.direccion || "Delta del Tigre"}
                            </p>
                        </div>
                    </div>

                    <a
                        href="mailto:soporte@hostflow.com"
                        className="shrink-0 text-xs font-semibold hover:underline"
                        style={{ color: colorMarca }}
                    >
                        ¿Necesitás ayuda?
                    </a>
                </div>
            </header>

            <div className="mx-auto w-full max-w-xl px-5 pt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>
                        Paso {paso} de {PASOS.length}
                    </span>
                    <span>{pasoActual.titulo}</span>
                </div>
                <div
                    className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#e3ded2]"
                    role="progressbar"
                    aria-label={`Paso ${paso} de ${PASOS.length}`}
                    aria-valuemin={1}
                    aria-valuemax={PASOS.length}
                    aria-valuenow={paso}
                >
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${(paso / PASOS.length) * 100}%`,
                            backgroundColor: colorMarca,
                        }}
                    />
                </div>
            </div>

            <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-12 pt-8">
                <div
                    className="grid size-11 place-items-center rounded-2xl"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${colorMarca} 12%, white)`,
                        color: colorMarca,
                    }}
                >
                    <Icono className="size-5" aria-hidden="true" />
                </div>

                <p
                    className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: colorMarca }}
                >
                    {pasoActual.eyebrow}
                </p>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.15] tracking-tight">
                    {pasoActual.heading}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#71817b]">
                    {paso === 1
                        ? `Completá tus datos para agilizar el ingreso a ${complejo.nombre}.`
                        : "Estamos preparando esta sección del formulario."}
                </p>

                {paso === 1 ? (
                    <form onSubmit={continuarPasoUno} noValidate className="mt-7 space-y-4">
                        <Campo label="Nombre y apellido" htmlFor="nombre" error={errores.nombre}>
                            <Input
                                id="nombre"
                                name="nombre"
                                value={datos.nombre}
                                onChange={(event) => actualizar("nombre", event.currentTarget.value)}
                                placeholder="Ej: Marina López"
                                autoComplete="name"
                                aria-invalid={Boolean(errores.nombre)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="DNI o pasaporte" htmlFor="documento" error={errores.documento}>
                            <Input
                                id="documento"
                                name="documento"
                                value={datos.documento}
                                onChange={(event) => actualizar("documento", event.currentTarget.value)}
                                placeholder="Número de documento"
                                autoComplete="off"
                                aria-invalid={Boolean(errores.documento)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Teléfono" htmlFor="telefono" error={errores.telefono}>
                            <Input
                                id="telefono"
                                name="telefono"
                                type="tel"
                                value={datos.telefono}
                                onChange={(event) => actualizar("telefono", event.currentTarget.value)}
                                placeholder="+54 11 0000 0000"
                                autoComplete="tel"
                                aria-invalid={Boolean(errores.telefono)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Email" htmlFor="email" error={errores.email}>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={datos.email}
                                onChange={(event) => actualizar("email", event.currentTarget.value)}
                                placeholder="nombre@email.com"
                                autoComplete="email"
                                aria-invalid={Boolean(errores.email)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Cantidad de huéspedes" htmlFor="huespedes" error={errores.huespedes}>
                            <Input
                                id="huespedes"
                                name="huespedes"
                                type="number"
                                min={1}
                                max={10}
                                inputMode="numeric"
                                value={datos.huespedes}
                                onChange={(event) => actualizar("huespedes", event.currentTarget.value)}
                                aria-invalid={Boolean(errores.huespedes)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Llegada" htmlFor="llegada" error={errores.llegada}>
                            <Input
                                id="llegada"
                                name="llegada"
                                type="date"
                                min={hoy}
                                value={datos.llegada}
                                onChange={(event) => actualizar("llegada", event.currentTarget.value)}
                                aria-invalid={Boolean(errores.llegada)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Salida" htmlFor="salida" error={errores.salida}>
                            <Input
                                id="salida"
                                name="salida"
                                type="date"
                                min={datos.llegada || hoy}
                                value={datos.salida}
                                onChange={(event) => actualizar("salida", event.currentTarget.value)}
                                aria-invalid={Boolean(errores.salida)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="inline-flex h-12 min-w-36 cursor-pointer items-center justify-center rounded-xl px-7 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ec]"
                                style={{ backgroundColor: colorMarca }}
                            >
                                Continuar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-7">
                        <div className="rounded-2xl border border-dashed border-[#d9d3c4] bg-white/60 p-6">
                            <p className="text-sm font-semibold">Sección en preparación</p>
                            <p className="mt-1 text-sm text-[#71817b]">
                                Pronto vas a poder completar {pasoActual.titulo.toLowerCase()} desde acá.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={volver}
                                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-[#d9d3c4] bg-white px-6 text-sm font-semibold text-[#526963] transition hover:bg-[#f1ece0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                            >
                                Volver
                            </button>

                            {paso < PASOS.length ? (
                                <button
                                    type="button"
                                    onClick={siguiente}
                                    className="inline-flex h-12 min-w-36 cursor-pointer items-center justify-center rounded-xl px-7 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ec]"
                                    style={{ backgroundColor: colorMarca }}
                                >
                                    Continuar
                                </button>
                            ) : null}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
