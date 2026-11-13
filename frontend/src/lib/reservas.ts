import type { Allergy } from "@/types/booking.type";

export type EstadoReserva = "pendiente" | "confirmada" | "finalizada" | "cancelada";

export type Reserva = {
    id: string;
    huesped: string;
    checkIn: string;
    checkOut: string;
    personas: number | null;
    estado: EstadoReserva;
    complejo: string | null;
    total: number | null;
};

export type FiltrosReservas = {
    q?: string;
    estado?: EstadoReserva;
};

export const ESTADOS: { value: EstadoReserva; label: string }[] = [
    { value: "pendiente", label: "Pendiente" },
    { value: "confirmada", label: "Confirmada" },
    { value: "cancelada", label: "Cancelada" },
    { value: "finalizada", label: "Finalizada" },
];

export const ETIQUETAS_ALERGIA: Record<Allergy, string> = {
    GLUTEN: "Gluten",
    LACTOSA: "Lactosa",
    MANI: "Maní",
    FRUTOS_SECOS: "Frutos secos",
    HUEVO: "Huevo",
    SOJA: "Soja",
    MARISCOS: "Mariscos",
    PESCADO: "Pescado",
};

export function esEstadoValido(valor: unknown): valor is EstadoReserva {
    return ESTADOS.some((e) => e.value === valor);
}

/* ------------------------------ Formato ------------------------------ */

const LOCALE = "es-AR";
const TIMEZONE = "America/Argentina/Buenos_Aires";
const MONEDA = "ARS";
const FECHA_SIMPLE = /^\d{4}-\d{2}-\d{2}$/;

export function formatFecha(iso: string, conAnio = false) {
    if (FECHA_SIMPLE.test(iso)) {
        const [anio, mes, dia] = iso.split("-").map(Number);
        return new Intl.DateTimeFormat(LOCALE, {
            day: "numeric",
            month: "short",
            ...(conAnio ? { year: "numeric" } : {}),
            timeZone: "UTC",
        }).format(new Date(Date.UTC(anio, mes - 1, dia)));
    }

    return formatFechaHora(iso, conAnio);
}

export function formatFechaHora(iso: string, conAnio = false) {
    const conOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : `${iso}-03:00`;

    return new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "short",
        ...(conAnio ? { year: "numeric" } : {}),
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIMEZONE,
    }).format(new Date(conOffset));
}

export function formatTotal(total: number) {
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: MONEDA,
        maximumFractionDigits: 0,
    }).format(total);
}

export function iniciales(nombre: string) {
    return nombre
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}
