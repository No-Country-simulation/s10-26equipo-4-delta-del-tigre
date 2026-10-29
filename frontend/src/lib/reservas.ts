export type EstadoReserva = "pendiente" | "onboarding_completo";

export type Reserva = {
    id: string;
    huesped: string;
    checkIn: string; // ISO 8601
    checkOut: string; // ISO 8601
    personas: number;
    estado: EstadoReserva;
    // Opcionales: se muestran solo cuando el dato está disponible
    complejo?: string | null;
    total?: number | null;
};

export type FiltrosReservas = {
    q?: string;
    estado?: EstadoReserva;
};

export const ESTADOS: { value: EstadoReserva; label: string }[] = [
    { value: "pendiente", label: "Pendiente" },
    { value: "onboarding_completo", label: "Onboarding completo" },
];

export function esEstadoValido(valor: unknown): valor is EstadoReserva {
    return ESTADOS.some((e) => e.value === valor);
}

/* ------------------------------ Formato ------------------------------ */

// Ajustá según tu operación
const LOCALE = "es-AR";
const TIMEZONE = "America/Argentina/Buenos_Aires";
const MONEDA = "ARS";

export function formatFecha(iso: string, conAnio = false) {
    return new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "short",
        ...(conAnio ? { year: "numeric" } : {}),
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIMEZONE,
    }).format(new Date(iso));
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

/* ---------------------------- Capa de datos ---------------------------- */
// TODO: reemplazar el mock por tu API / base de datos.
// Ejemplo:
//   const res = await fetch(`${process.env.API_URL}/reservas?${params}`, { cache: "no-store" });
//   if (!res.ok) throw new Error("No se pudieron cargar las reservas");
//   return res.json();

const MOCK: Reserva[] = [
    {
        id: "res_001",
        huesped: "Marina López",
        checkIn: "2026-03-14T14:00:00-03:00",
        checkOut: "2026-03-17T10:00:00-03:00",
        personas: 2,
        estado: "pendiente",
        complejo: "Cabañas del Lago",
        total: 185000,
    },
    {
        id: "res_002",
        huesped: "Tomás Pereira",
        checkIn: "2026-03-16T15:30:00-03:00",
        checkOut: "2026-03-19T10:00:00-03:00",
        personas: 4,
        estado: "onboarding_completo",
        complejo: null, // dato aún no disponible
        total: null,
    },
];

export async function getReservas({ q, estado }: FiltrosReservas): Promise<Reserva[]> {
    const termino = q?.trim().toLowerCase();
    return MOCK.filter(
        (r) =>
            (!termino || r.huesped.toLowerCase().includes(termino)) &&
            (!estado || r.estado === estado),
    ).sort((a, b) => a.checkIn.localeCompare(b.checkIn)); // por fecha de llegada
}

export async function getReservaById(id: string): Promise<Reserva | null> {
    return MOCK.find((r) => r.id === id) ?? null;
}

export async function getResumen() {
    return { pendientes: 8, proximosIngresos: 12, onboardingCompleto: 84, variacionMes: 6 };
}
