"use client";

import Image from "next/image";
import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
    Check,
    ChevronDown,
    Copy,
    CreditCard,
    Loader2,
    Minus,
    Plus,
    Ship,
    Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    type ComplejoPublico,
    type OnboardingPayload,
    type OnboardingResultado,
} from "@/services/public/public.service";
import { enviarOnboardingAction } from "./actions";
import {
    ALERGIAS_OPCIONES,
    ahoraLocalISO,
    datosHuespedSchema,
    hoyISO,
    lanchaSchema,
    preferenciasHuespedSchema,
    type Alergia,
    type DatosHuespedForm,
    type LanchaForm,
    type PreferenciasHuespedForm,
} from "./schemas/onboarding.schema";

type PasoConfig = {
    titulo: string;
    eyebrow: string;
    heading: string;
};

const PASOS: PasoConfig[] = [
    {
        titulo: "Tus datos",
        eyebrow: "Te damos la bienvenida",
        heading: "Empecemos por conocerte",
    },
    {
        titulo: "Preferencias",
        eyebrow: "Contanos más",
        heading: "Preferencias y alergias",
    },
    {
        titulo: "Adicionales",
        eyebrow: "Hacé tu estadía especial",
        heading: "Sumá experiencias",
    },
    {
        titulo: "Lancha remis",
        eyebrow: "Llega sin complicaciones",
        heading: "Tu traslado por el río",
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

const PREFERENCIAS_INICIALES: PreferenciasHuespedForm = {
    alergias: [],
    otraAlergia: "",
    preferencias: "",
};

const LANCHA_INICIAL: LanchaForm = {
    necesitaLancha: false,
    salidaLancha: "",
    regresoLancha: "",
    pasajerosLancha: "2",
    puntoSalida: "",
    comentariosLancha: "",
};

/* ------------------------------------------------------------------ */
/* Clases base: todos los colores salen de variables CSS de la marca   */
/* ------------------------------------------------------------------ */

const INPUT_CLASS =
    "h-12 rounded-xl border-[var(--line)] bg-white px-3.5 text-sm text-[var(--ink)] shadow-none placeholder:text-[var(--ink)]/40 focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]";

const TEXTAREA_CLASS =
    "w-full resize-none rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 text-sm text-[var(--ink)] shadow-none outline-none transition placeholder:text-[var(--ink)]/40 focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]";

const SELECT_CLASS =
    "h-12 w-full appearance-none rounded-xl border border-[var(--line)] bg-white px-3.5 pr-10 text-sm text-[var(--ink)] shadow-none outline-none transition focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand)]";

const BTN_PRIMARY =
    "inline-flex h-12 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-70";

const BTN_SECONDARY =
    "inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-[var(--line)] bg-white px-6 text-sm font-semibold text-[var(--ink)]/70 transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60";

const ESTILO_BTN_PRIMARY: CSSProperties = {
    backgroundColor: "var(--brand)",
    color: "var(--brand-contrast)",
};

const PUNTOS_SALIDA = [
    "Estación Fluvial de Tigre",
    "Muelle de Tigre",
    "Puerto de Frutos",
    "Muelle de San Fernando",
    "Muelle de Carapachay",
];

/* ------------------------------------------------------------------ */
/* Helpers de color                                                    */
/* ------------------------------------------------------------------ */

const COLOR_FALLBACK = "#174f40";

function normalizarHex(valor?: string) {
    const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(valor?.trim() ?? "");
    if (!match) return null;
    const hex =
        match[1].length === 3
            ? match[1]
                .split("")
                .map((c) => c + c)
                .join("")
            : match[1];
    return `#${hex.toLowerCase()}`;
}

/** Acepta "#aabbcc" o "#aabbcc, #ddeeff" (primario, secundario). */
function parseColoresMarca(valor: string | null) {
    const [p, s] = (valor ?? "").split(",").map((c) => normalizarHex(c));
    return { primario: p ?? COLOR_FALLBACK, secundario: s ?? null };
}

function luminancia(hex: string) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Color de texto (blanco u oscuro) legible sobre un fondo de marca. */
function colorSobre(hex: string) {
    return luminancia(hex) > 0.5 ? "#111111" : "#ffffff";
}

/** Si la marca es muy clara, oscurece el color cuando se usa como texto sobre blanco. */
function colorTexto(hex: string) {
    return luminancia(hex) > 0.4
        ? `color-mix(in srgb, ${hex} 45%, #000000)`
        : hex;
}

function crearEstiloMarca(primario: string, secundario: string | null) {
    const acento = secundario ?? primario;
    return {
        "--brand": primario,
        "--brand-text": colorTexto(primario),
        "--brand-contrast": colorSobre(primario),
        "--brand-soft": `color-mix(in srgb, ${primario} 8%, white)`,
        "--brand-border": `color-mix(in srgb, ${primario} 25%, white)`,
        "--accent": acento,
        "--accent-text": colorTexto(acento),
        "--accent-soft": `color-mix(in srgb, ${acento} 12%, white)`,
        "--accent-border": `color-mix(in srgb, ${acento} 30%, white)`,
        "--bg": `color-mix(in srgb, ${primario} 4%, white)`,
        "--line": `color-mix(in srgb, ${primario} 12%, #e5e5e5)`,
        "--ink": `color-mix(in srgb, ${primario} 18%, #111111)`,
    } as CSSProperties;
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

function formatearPrecio(precio: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })
        .format(precio)
        .replace(/\s/g, "");
}

function descripcionPaso(paso: number, nombre: string) {
    switch (paso) {
        case 1:
            return `Completá tus datos para agilizar el ingreso a ${nombre}.`;
        case 2:
            return "Contanos si tenés alergias, preferencias o necesidades especiales para tu estadía.";
        case 3:
            return "Elegí los adicionales que quieras. Podrás abonarlos por transferencia.";
        case 4:
            return "Podemos ayudarte a coordinar una lancha remis premium hasta la cabaña.";
        default:
            return "";
    }
}

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                              */
/* ------------------------------------------------------------------ */

function LogoComplejo({
    complejo,
    colorMarca,
}: {
    complejo: ComplejoPublico;
    colorMarca: string;
}) {
    const [fallo, setFallo] = useState(false);

    if (complejo.logo && !fallo) {
        return (
            // <img> en lugar de next/image: funciona con cualquier URL externa
            // sin configurar dominios en next.config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={complejo.logo}
                alt={`Logo de ${complejo.nombre}`}
                onError={() => setFallo(true)}
                className="h-12 w-auto max-w-[170px] shrink-0 object-contain"
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-xl text-sm font-semibold"
            style={{ backgroundColor: colorMarca, color: colorSobre(colorMarca) }}
        >
            {iniciales(complejo.nombre)}
        </span>
    );
}

function CabeceraComplejo({
    complejo,
    colorMarca,
}: {
    complejo: ComplejoPublico;
    colorMarca: string;
}) {
    return (
        <header className="border-b border-[var(--line)] bg-white">
            <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <LogoComplejo complejo={complejo} colorMarca={colorMarca} />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-tight">
                            {complejo.nombre}
                        </p>
                        {complejo.direccion ? (
                            <p className="mt-0.5 truncate text-[11px] text-[var(--ink)]/60">
                                {complejo.direccion}
                            </p>
                        ) : null}
                    </div>
                </div>

                <a
                    href="mailto:soporte@hostflow.com"
                    className="shrink-0 text-xs font-semibold text-[var(--brand-text)] hover:underline"
                >
                    ¿Necesitás ayuda?
                </a>
            </div>
        </header>
    );
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
                className="mb-1.5 block text-xs font-semibold text-[var(--ink)]"
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

/* ------------------------------------------------------------------ */
/* Wizard                                                              */
/* ------------------------------------------------------------------ */

export function OnboardingWizard({ complejo }: { complejo: ComplejoPublico }) {
    const { primario: colorMarca, secundario } = parseColoresMarca(
        complejo.coloresMarca,
    );
    const estiloMarca = crearEstiloMarca(colorMarca, secundario);

    const [paso, setPaso] = useState(1);
    const [datos, setDatos] = useState<DatosHuespedForm>(DATOS_INICIALES);
    const [preferencias, setPreferencias] = useState<PreferenciasHuespedForm>(
        PREFERENCIAS_INICIALES,
    );
    const [adicionales, setAdicionales] = useState<Record<string, number>>({});
    const [lancha, setLancha] = useState<LanchaForm>(LANCHA_INICIAL);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [errorEnvio, setErrorEnvio] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState<OnboardingResultado | null>(null);
    const [aliasCopiado, setAliasCopiado] = useState(false);

    const pasoActual = PASOS[paso - 1];
    const hoy = hoyISO();
    const ahora = ahoraLocalISO();
    const totalAdicionales = complejo.addons.reduce(
        (total, addon) => total + (adicionales[addon.id] ?? 0) * addon.precio,
        0,
    );

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

    function actualizarPreferencias(
        campo: "preferencias" | "otraAlergia",
        valor: string,
    ) {
        setPreferencias((previas) => ({ ...previas, [campo]: valor }));
        setErrores((previos) => {
            if (!previos[campo]) return previos;
            const siguientes = { ...previos };
            delete siguientes[campo];
            return siguientes;
        });
    }

    function alternarAlergia(alergia: Alergia) {
        setPreferencias((previas) => ({
            ...previas,
            alergias: previas.alergias.includes(alergia)
                ? previas.alergias.filter((item) => item !== alergia)
                : [...previas.alergias, alergia],
        }));
    }

    function continuarPasoDos(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validacion = preferenciasHuespedSchema.safeParse(preferencias);
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
        setPaso(3);
    }

    function cambiarCantidad(id: string, delta: number) {
        setAdicionales((previos) => {
            const cantidad = Math.min(50, Math.max(0, (previos[id] ?? 0) + delta));
            if (cantidad === 0) {
                const siguientes = { ...previos };
                delete siguientes[id];
                return siguientes;
            }
            return { ...previos, [id]: cantidad };
        });
    }

    function continuarPasoTres(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrores({});
        setErrorEnvio("");
        setPaso(4);
    }

    function actualizarLancha(
        campo:
            | "salidaLancha"
            | "regresoLancha"
            | "pasajerosLancha"
            | "puntoSalida"
            | "comentariosLancha",
        valor: string,
    ) {
        setLancha((previa) => ({ ...previa, [campo]: valor }));
        setErrores((previos) => {
            if (!previos[campo]) return previos;
            const siguientes = { ...previos };
            delete siguientes[campo];
            return siguientes;
        });
        setErrorEnvio("");
    }

    function elegirLancha(necesita: boolean) {
        setLancha((previa) => ({
            ...previa,
            necesitaLancha: necesita,
            pasajerosLancha:
                necesita && !previa.pasajerosLancha
                    ? datos.huespedes
                    : previa.pasajerosLancha,
        }));
        setErrores({});
        setErrorEnvio("");
    }

    async function continuarPasoCuatro(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorEnvio("");

        const validacion = lanchaSchema.safeParse(lancha);
        if (!validacion.success) {
            const siguientes: Record<string, string> = {};
            for (const issue of validacion.error.issues) {
                const campo = String(issue.path[0] ?? "");
                if (campo && !siguientes[campo]) siguientes[campo] = issue.message;
            }
            setErrores(siguientes);
            return;
        }

        if (
            lancha.necesitaLancha &&
            Number(lancha.pasajerosLancha) > Number(datos.huespedes)
        ) {
            setErrores({
                pasajerosLancha: `Los pasajeros no pueden superar los ${datos.huespedes} huéspedes.`,
            });
            return;
        }

        setErrores({});

        const documento = datos.documento.trim();
        const payload: OnboardingPayload = {
            guestName: datos.nombre.trim(),
            guestEmail: datos.email.trim(),
            guestPhone: datos.telefono.trim(),
            guestIdentificationType: /[A-Za-z]/.test(documento) ? "PASAPORTE" : "DNI",
            guestIdentificationNumber: documento,
            checkIn: datos.llegada,
            checkOut: datos.salida,
            guestsCount: Number(datos.huespedes),
            preferences: preferencias.preferencias.trim() || undefined,
            allergies: preferencias.alergias,
            otherAllergies: preferencias.otraAlergia.trim() || undefined,
            addons: Object.entries(adicionales).map(([addonId, quantity]) => ({
                addonId,
                quantity,
            })),
            boat: lancha.necesitaLancha
                ? {
                    departureAt: lancha.salidaLancha,
                    returnAt: lancha.regresoLancha,
                    passengers: Number(lancha.pasajerosLancha),
                    pickupPoint: lancha.puntoSalida.trim() || undefined,
                    comments: lancha.comentariosLancha.trim() || undefined,
                }
                : undefined,
        };

        setEnviando(true);
        try {
            const respuesta = await enviarOnboardingAction(
                complejo.slug,
                payload,
            );

            if (respuesta.ok) {
                setResultado(respuesta.data);
            } else {
                setErrorEnvio(respuesta.message);
            }
        } catch {
            setErrorEnvio(
                "No se pudo enviar el onboarding. Intentá nuevamente.",
            );
        } finally {
            setEnviando(false);
        }
    }

    function volver() {
        setErrores({});
        setErrorEnvio("");
        setPaso((actual) => Math.max(actual - 1, 1));
    }

    async function copiarAlias(alias: string) {
        try {
            await navigator.clipboard.writeText(alias);
            setAliasCopiado(true);
            window.setTimeout(() => setAliasCopiado(false), 2000);
        } catch {
            setAliasCopiado(false);
        }
    }

    /* ---------------------------- Pantalla final ---------------------------- */

    if (resultado) {
        const totalMostrar = resultado.total > 0 ? resultado.total : totalAdicionales;
        const addonsSeleccionados = complejo.addons.filter(
            (addon) => (adicionales[addon.id] ?? 0) > 0,
        );
        const pago = resultado.paymentInfo;
        const nombrePila = datos.nombre.trim().split(/\s+/)[0] ?? "";

        return (
            <div
                style={estiloMarca}
                className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--ink)]"
            >
                <CabeceraComplejo complejo={complejo} colorMarca={colorMarca} />

                <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12">
                    <div className="flex flex-col items-center text-center">
                        <span
                            className="grid size-20 place-items-center rounded-full"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${colorMarca} 14%, white)`,
                            }}
                        >
                            <span
                                className="grid size-14 place-items-center rounded-full"
                                style={{
                                    backgroundColor: "var(--brand)",
                                    color: "var(--brand-contrast)",
                                }}
                            >
                                <Check className="size-7" strokeWidth={2.5} aria-hidden="true" />
                            </span>
                        </span>

                        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-text)]">
                            Check-in completado
                        </p>
                        <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight">
                            ¡Todo listo{nombrePila ? `, ${nombrePila}` : ""}!
                        </h1>
                        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--ink)]/70">
                            Recibimos tus datos. En breve, {complejo.nombre} te espera para
                            que disfrutes tu estadía.
                        </p>
                    </div>

                    {totalMostrar > 0 && addonsSeleccionados.length > 0 ? (
                        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-base font-medium">Resumen de adicionales</h2>
                                {resultado.bookingId ? (
                                    <p className="text-xs text-[var(--ink)]/45">
                                        Reserva #{resultado.bookingId}
                                    </p>
                                ) : null}
                            </div>
                            <div className="mt-4 space-y-3">
                                {addonsSeleccionados.map((addon) => {
                                    const cantidad = adicionales[addon.id] ?? 0;

                                    return (
                                        <div
                                            key={addon.id}
                                            className="flex items-center justify-between gap-4 text-sm"
                                        >
                                            <span className="text-[var(--ink)]/70">
                                                {addon.nombre} · {cantidad}
                                            </span>
                                            <span className="font-medium">
                                                {formatearPrecio(addon.precio * cantidad)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4">
                                <span className="text-sm font-semibold">Total a transferir</span>
                                <span className="text-2xl font-semibold">
                                    {formatearPrecio(totalMostrar)}
                                </span>
                            </div>
                        </section>
                    ) : null}

                    {pago?.aliasCbu && totalMostrar > 0 ? (
                        <section className="mt-4 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-5">
                            <div className="flex items-center gap-2.5">
                                <span className="grid size-8 place-items-center rounded-lg bg-white/70 text-[var(--accent-text)]">
                                    <CreditCard className="size-4" aria-hidden="true" />
                                </span>
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-text)]">
                                    Datos de pago
                                </p>
                            </div>

                            <h2 className="mt-4 text-xl font-semibold">
                                Asegurá tus adicionales
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-[var(--ink)]/70">
                                Transferí el monto total a este Alias para asegurar tus
                                adicionales.
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-white p-4">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]/45">
                                        Alias
                                    </p>
                                    <p className="mt-0.5 truncate text-lg font-semibold">
                                        {pago.aliasCbu}
                                    </p>
                                    {pago.accountHolder ? (
                                        <p className="mt-0.5 text-xs text-[var(--ink)]/70">
                                            Titular: {pago.accountHolder}
                                        </p>
                                    ) : null}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copiarAlias(pago.aliasCbu)}
                                    className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                                >
                                    {aliasCopiado ? "Copiado" : "Copiar alias"}
                                    <Copy className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    ) : null}

                    {resultado.boatRequested ? (
                        <section className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--brand-soft)] p-4">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/80 text-[var(--brand-text)]">
                                <Ship className="size-4" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">
                                    Solicitud de lancha recibida
                                </p>
                                <p className="mt-0.5 text-xs leading-5 text-[var(--ink)]/70">
                                    Recibimos tu solicitud de cotización, te contactaremos pronto.
                                </p>
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>
        );
    }

    /* ------------------------------ Formulario ------------------------------ */

    return (
        <div
            style={estiloMarca}
            className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--ink)]"
        >
            <CabeceraComplejo complejo={complejo} colorMarca={colorMarca} />

            <div className="mx-auto w-full max-w-xl px-5 pt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>
                        Paso {paso} de {PASOS.length}
                    </span>
                    <span>{pasoActual.titulo}</span>
                </div>
                <div
                    className="mt-2 h-[3px] overflow-hidden rounded-full bg-[var(--line)]"
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
                            backgroundColor: "var(--brand)",
                        }}
                    />
                </div>
            </div>

            <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-12 pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-text)]">
                    {pasoActual.eyebrow}
                </p>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.15] tracking-tight">
                    {pasoActual.heading}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[var(--ink)]/70">
                    {descripcionPaso(paso, complejo.nombre)}
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
                            <button type="submit" className={BTN_PRIMARY} style={ESTILO_BTN_PRIMARY}>
                                Continuar
                            </button>
                        </div>
                    </form>
                ) : paso === 2 ? (
                    <form onSubmit={continuarPasoDos} noValidate className="mt-7 space-y-5">
                        <fieldset>
                            <legend className="text-xs font-semibold text-[var(--ink)]">
                                Alergias o intolerancias
                            </legend>
                            <p className="mt-1 text-xs text-[var(--ink)]/70">
                                Seleccioná todas las que correspondan. Si no tenés, podés continuar.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {ALERGIAS_OPCIONES.map((opcion) => {
                                    const activa = preferencias.alergias.includes(opcion.value);

                                    return (
                                        <button
                                            key={opcion.value}
                                            type="button"
                                            aria-pressed={activa}
                                            onClick={() => alternarAlergia(opcion.value)}
                                            className={`flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${activa
                                                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                                                : "border-[var(--line)] bg-white text-[var(--ink)]/70 hover:bg-[var(--brand-soft)]"
                                                }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`grid size-4 shrink-0 place-items-center rounded-[5px] border ${activa
                                                    ? "border-transparent"
                                                    : "border-[var(--line)] bg-white"
                                                    }`}
                                                style={
                                                    activa
                                                        ? {
                                                            backgroundColor: "var(--brand)",
                                                            color: "var(--brand-contrast)",
                                                        }
                                                        : undefined
                                                }
                                            >
                                                {activa ? <Check className="size-3" /> : null}
                                            </span>
                                            {opcion.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <Campo label="Otra alergia" htmlFor="otraAlergia" error={errores.otraAlergia}>
                            <Input
                                id="otraAlergia"
                                name="otraAlergia"
                                value={preferencias.otraAlergia}
                                onChange={(event) =>
                                    actualizarPreferencias("otraAlergia", event.currentTarget.value)
                                }
                                placeholder="Si no está en la lista, escribila acá"
                                maxLength={500}
                                aria-invalid={Boolean(errores.otraAlergia)}
                                className={INPUT_CLASS}
                            />
                        </Campo>

                        <Campo label="Preferencias" htmlFor="preferencias" error={errores.preferencias}>
                            <textarea
                                id="preferencias"
                                name="preferencias"
                                rows={4}
                                value={preferencias.preferencias}
                                onChange={(event) =>
                                    actualizarPreferencias("preferencias", event.currentTarget.value)
                                }
                                placeholder="Ej: cama matrimonial, llegada temprana, sin aromas fuertes…"
                                maxLength={1000}
                                aria-invalid={Boolean(errores.preferencias)}
                                className={TEXTAREA_CLASS}
                            />
                            <p className="mt-1 text-right text-[11px] text-[var(--ink)]/45">
                                {preferencias.preferencias.length}/1000
                            </p>
                        </Campo>

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button type="button" onClick={volver} className={BTN_SECONDARY}>
                                Volver
                            </button>
                            <button type="submit" className={BTN_PRIMARY} style={ESTILO_BTN_PRIMARY}>
                                Continuar
                            </button>
                        </div>
                    </form>
                ) : paso === 3 ? (
                    <form onSubmit={continuarPasoTres} noValidate className="mt-7 space-y-4">
                        {complejo.addons.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/60 p-6">
                                <p className="text-sm font-semibold">Sin adicionales disponibles</p>
                                <p className="mt-1 text-sm text-[var(--ink)]/70">
                                    Este alojamiento todavía no cargó servicios extra. Podés
                                    continuar.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {complejo.addons.map((addon) => {
                                    const cantidad = adicionales[addon.id] ?? 0;
                                    const seleccionado = cantidad > 0;

                                    return (
                                        <div
                                            key={addon.id}
                                            className={`flex overflow-hidden rounded-2xl border bg-white transition ${seleccionado
                                                ? "border-[var(--brand)]"
                                                : "border-[var(--line)]"
                                                }`}
                                        >
                                            <div className="relative w-[120px] shrink-0 self-stretch bg-[var(--brand-soft)] sm:w-[150px]">
                                                {addon.imagen ? (
                                                    <Image
                                                        src={addon.imagen}
                                                        alt=""
                                                        fill
                                                        unoptimized
                                                        sizes="150px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-full w-full place-items-center text-[var(--brand-text)]">
                                                        <Sparkles className="size-6" aria-hidden="true" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
                                                <div>
                                                    <p className="text-base font-semibold leading-tight">
                                                        {addon.nombre}
                                                    </p>
                                                    {addon.descripcion ? (
                                                        <p className="mt-1 text-xs leading-5 text-[var(--ink)]/70">
                                                            {addon.descripcion}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold">
                                                        {formatearPrecio(addon.precio)}
                                                    </p>

                                                    <div className="flex shrink-0 items-center gap-2.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => cambiarCantidad(addon.id, -1)}
                                                            disabled={cantidad === 0}
                                                            aria-label={`Quitar un ${addon.nombre}`}
                                                            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]/70 transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <Minus className="size-4" aria-hidden="true" />
                                                        </button>
                                                        <span className="w-5 text-center text-sm font-semibold">
                                                            {cantidad}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => cambiarCantidad(addon.id, 1)}
                                                            aria-label={`Agregar un ${addon.nombre}`}
                                                            className="grid size-10 cursor-pointer place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]/70 transition hover:bg-[var(--brand-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                                                        >
                                                            <Plus className="size-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {totalAdicionales > 0 ? (
                            <div className="flex items-center justify-between rounded-xl bg-[var(--brand-soft)] px-4 py-3.5">
                                <span className="text-sm font-semibold">Total de adicionales</span>
                                <span className="text-sm font-semibold text-[var(--brand-text)]">
                                    {formatearPrecio(totalAdicionales)}
                                </span>
                            </div>
                        ) : null}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button type="button" onClick={volver} className={BTN_SECONDARY}>
                                Volver
                            </button>
                            <button type="submit" className={BTN_PRIMARY} style={ESTILO_BTN_PRIMARY}>
                                Continuar
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={continuarPasoCuatro} noValidate className="mt-7 space-y-5">
                        <div
                            className={`rounded-2xl border bg-white p-5 transition ${lancha.necesitaLancha
                                ? "border-[var(--brand)]"
                                : "border-[var(--line)]"
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
                                    <Ship className="size-6" aria-hidden="true" />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-text)]">
                                        Servicio recomendado
                                    </p>
                                    <p className="mt-1 text-lg font-semibold leading-tight">
                                        Cotizar lancha remis
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--ink)]/70">
                                        Viaje privado, seguro y directo.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="checkbox"
                                    aria-checked={lancha.necesitaLancha}
                                    aria-label="Cotizar lancha remis"
                                    onClick={() => elegirLancha(!lancha.necesitaLancha)}
                                    className={`grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${lancha.necesitaLancha
                                        ? "border-transparent"
                                        : "border-[var(--line)] bg-white"
                                        }`}
                                    style={
                                        lancha.necesitaLancha
                                            ? {
                                                backgroundColor: "var(--brand)",
                                                color: "var(--brand-contrast)",
                                            }
                                            : undefined
                                    }
                                >
                                    {lancha.necesitaLancha ? (
                                        <Check className="size-4" aria-hidden="true" />
                                    ) : null}
                                </button>
                            </div>

                            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[var(--accent-soft)] px-3.5 py-3">
                                <Check
                                    className="mt-0.5 size-4 shrink-0 text-[var(--accent-text)]"
                                    aria-hidden="true"
                                />
                                <p className="text-xs leading-5 text-[var(--ink)]/70">
                                    <span className="font-semibold text-[var(--ink)]">
                                        Sin costo, solo cotizamos.
                                    </span>{" "}
                                    Recibirás el valor antes de confirmar.
                                </p>
                            </div>

                            {lancha.necesitaLancha ? (
                                <div className="mt-5 space-y-4 border-t border-[var(--line)] pt-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Campo
                                            label="Horario de llegada"
                                            htmlFor="salidaLancha"
                                            error={errores.salidaLancha}
                                        >
                                            <Input
                                                id="salidaLancha"
                                                name="salidaLancha"
                                                type="datetime-local"
                                                min={ahora}
                                                value={lancha.salidaLancha}
                                                onChange={(event) =>
                                                    actualizarLancha("salidaLancha", event.currentTarget.value)
                                                }
                                                aria-invalid={Boolean(errores.salidaLancha)}
                                                className={INPUT_CLASS}
                                            />
                                        </Campo>
                                        <Campo
                                            label="Horario de regreso"
                                            htmlFor="regresoLancha"
                                            error={errores.regresoLancha}
                                        >
                                            <Input
                                                id="regresoLancha"
                                                name="regresoLancha"
                                                type="datetime-local"
                                                min={lancha.salidaLancha || ahora}
                                                value={lancha.regresoLancha}
                                                onChange={(event) =>
                                                    actualizarLancha("regresoLancha", event.currentTarget.value)
                                                }
                                                aria-invalid={Boolean(errores.regresoLancha)}
                                                className={INPUT_CLASS}
                                            />
                                        </Campo>
                                    </div>

                                    <Campo
                                        label="Punto de salida"
                                        htmlFor="puntoSalida"
                                        error={errores.puntoSalida}
                                    >
                                        <div className="relative">
                                            <select
                                                id="puntoSalida"
                                                name="puntoSalida"
                                                value={lancha.puntoSalida}
                                                onChange={(event) =>
                                                    actualizarLancha("puntoSalida", event.currentTarget.value)
                                                }
                                                aria-invalid={Boolean(errores.puntoSalida)}
                                                className={SELECT_CLASS}
                                            >
                                                <option value="">Elegí un punto</option>
                                                {PUNTOS_SALIDA.map((punto) => (
                                                    <option key={punto} value={punto}>
                                                        {punto}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--ink)]/70"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </Campo>

                                    <Campo
                                        label={`Cantidad de pasajeros (máx. ${datos.huespedes})`}
                                        htmlFor="pasajerosLancha"
                                        error={errores.pasajerosLancha}
                                    >
                                        <Input
                                            id="pasajerosLancha"
                                            name="pasajerosLancha"
                                            type="number"
                                            min={1}
                                            max={Number(datos.huespedes)}
                                            inputMode="numeric"
                                            value={lancha.pasajerosLancha}
                                            onChange={(event) =>
                                                actualizarLancha("pasajerosLancha", event.currentTarget.value)
                                            }
                                            aria-invalid={Boolean(errores.pasajerosLancha)}
                                            className={`${INPUT_CLASS} sm:max-w-[calc(50%-0.5rem)]`}
                                        />
                                    </Campo>
                                </div>
                            ) : null}
                        </div>

                        {errorEnvio ? (
                            <p
                                className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-3 text-sm text-[#8a3c30]"
                                role="alert"
                            >
                                {errorEnvio}
                            </p>
                        ) : null}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={volver}
                                disabled={enviando}
                                className={BTN_SECONDARY}
                            >
                                Volver
                            </button>
                            <button
                                type="submit"
                                disabled={enviando}
                                className={BTN_PRIMARY}
                                style={ESTILO_BTN_PRIMARY}
                            >
                                {enviando ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                        Enviando…
                                    </>
                                ) : (
                                    "Finalizar onboarding"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
