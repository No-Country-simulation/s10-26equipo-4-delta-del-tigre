export type EstadoReserva = "pendiente" | "confirmada" | "finalizada" | "cancelada";

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
    { value: "confirmada", label: "Confirmada" },
    { value: "cancelada", label: "Cancelada" },
    { value: "finalizada", label: "Finalizada" },
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
        huesped: "Tomás Pereira",
        checkIn: "2026-03-16T15:30:00-03:00",
        checkOut: "2026-03-19T10:00:00-03:00",
        personas: 4,
        estado: "confirmada",
        complejo: "Cabañas del Río",
        total: 850000,
    },
    {
        id: "res_002",
        huesped: "Lucía Fernández",
        checkIn: "2026-03-20T14:00:00-03:00",
        checkOut: "2026-03-23T10:00:00-03:00",
        personas: 2,
        estado: "pendiente",
        complejo: "Refugio del Delta",
        total: 620000,
    },
    {
        id: "res_003",
        huesped: "Martín Rodríguez",
        checkIn: "2026-03-10T15:00:00-03:00",
        checkOut: "2026-03-13T10:00:00-03:00",
        personas: 5,
        estado: "finalizada",
        complejo: "Cabañas del Río",
        total: 1100000,
    },
    {
        id: "res_004",
        huesped: "Sofía Martínez",
        checkIn: "2026-03-25T14:30:00-03:00",
        checkOut: "2026-03-28T10:00:00-03:00",
        personas: 3,
        estado: "cancelada",
        complejo: "Islas del Sol",
        total: 0,
    },
    {
        id: "res_005",
        huesped: "Diego González",
        checkIn: "2026-04-02T15:00:00-03:00",
        checkOut: "2026-04-06T10:00:00-03:00",
        personas: 6,
        estado: "confirmada",
        complejo: "Refugio del Delta",
        total: 1450000,
    },
    {
        id: "res_006",
        huesped: "Valentina López",
        checkIn: "2026-04-08T14:00:00-03:00",
        checkOut: "2026-04-10T10:00:00-03:00",
        personas: 2,
        estado: "pendiente",
        complejo: "Islas del Sol",
        total: 480000,
    },
    {
        id: "res_007",
        huesped: "Andrés Ramírez",
        checkIn: "2026-02-15T15:30:00-03:00",
        checkOut: "2026-02-18T10:00:00-03:00",
        personas: 4,
        estado: "finalizada",
        complejo: "Cabañas del Río",
        total: 920000,
    },
    {
        id: "res_008",
        huesped: "Camila Torres",
        checkIn: "2026-04-12T14:00:00-03:00",
        checkOut: "2026-04-15T10:00:00-03:00",
        personas: 3,
        estado: "cancelada",
        complejo: "Refugio del Delta",
        total: 0,
    },
    {
        id: "res_009",
        huesped: "Mateo Silva",
        checkIn: "2026-04-18T15:00:00-03:00",
        checkOut: "2026-04-22T10:00:00-03:00",
        personas: 5,
        estado: "confirmada",
        complejo: "Islas del Sol",
        total: 1250000,
    },
    {
        id: "res_010",
        huesped: "Isabella Castro",
        checkIn: "2026-04-20T14:00:00-03:00",
        checkOut: "2026-04-23T10:00:00-03:00",
        personas: 2,
        estado: "pendiente",
        complejo: "Cabañas del Río",
        total: 580000,
    },
    {
        id: "res_011",
        huesped: "Nicolás Herrera",
        checkIn: "2026-01-12T15:00:00-03:00",
        checkOut: "2026-01-16T10:00:00-03:00",
        personas: 4,
        estado: "finalizada",
        complejo: "Refugio del Delta",
        total: 1050000,
    },
    {
        id: "res_012",
        huesped: "Mariana Díaz",
        checkIn: "2026-04-25T14:30:00-03:00",
        checkOut: "2026-04-28T10:00:00-03:00",
        personas: 3,
        estado: "cancelada",
        complejo: "Islas del Sol",
        total: 0,
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
