import { ApiError } from "@/lib/api";
import {
    type EstadoReserva,
    type FiltrosReservas,
    type Reserva,
} from "@/lib/reservas";
import { getSessionToken } from "@/services/auth/session";
import {
    fetchBooking,
    fetchBookings,
} from "@/services/booking/booking.service";
import type {
    Allergy,
    BoatRequestApi,
    BookingAddonApi,
    BookingApi,
    BookingStatus,
    BookingSummaryApi,
} from "@/types/booking.type";
import { getOwnedComplejos } from "../../complejos/data/complejos.data";

const ESTADO_DESDE_API: Record<BookingStatus, EstadoReserva> = {
    PENDIENTE: "pendiente",
    CONFIRMADA: "confirmada",
    FINALIZADA: "finalizada",
    CANCELADA: "cancelada",
};

const ESTADO_HACIA_API: Record<EstadoReserva, BookingStatus> = {
    pendiente: "PENDIENTE",
    confirmada: "CONFIRMADA",
    finalizada: "FINALIZADA",
    cancelada: "CANCELADA",
};

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type ReservaDetalle = Reserva & {
    identificacionTipo: string | null;
    identificacionNumero: string | null;
    email: string | null;
    telefono: string | null;
    preferencias: string | null;
    alergias: Allergy[];
    otrasAlergias: string | null;
    adicionales: BookingAddonApi[];
    totalAdicionales: number;
    lanchas: BoatRequestApi[];
    creadaEl: string;
};

export type ResumenReservas = {
    pendientes: number;
    proximosIngresos: number;
    confirmadas: number;
    total: number;
};

async function requireSessionToken(): Promise<string> {
    const token = await getSessionToken();
    if (!token) {
        throw new ApiError("Tu sesión expiró. Iniciá sesión nuevamente.", 401);
    }
    return token;
}

function mapearResumen(
    reserva: BookingSummaryApi,
    complejo: string | null,
): Reserva {
    return {
        id: reserva.id,
        huesped: reserva.guestName,
        checkIn: reserva.checkIn,
        checkOut: reserva.checkOut,
        personas: null,
        estado: ESTADO_DESDE_API[reserva.status],
        complejo,
        total: null,
    };
}

function mapearDetalle(
    reserva: BookingApi,
    complejo: string | null,
): ReservaDetalle {
    return {
        id: reserva.id,
        huesped: reserva.guestName,
        checkIn: reserva.checkIn,
        checkOut: reserva.checkOut,
        personas: reserva.guestsCount,
        estado: ESTADO_DESDE_API[reserva.status],
        complejo,
        total: reserva.addonsTotal,
        identificacionTipo: reserva.guestIdentificationType,
        identificacionNumero: reserva.guestIdentificationNumber,
        email: reserva.guestEmail,
        telefono: reserva.guestPhone,
        preferencias: reserva.preferences,
        alergias: reserva.allergies,
        otrasAlergias: reserva.otherAllergies,
        adicionales: reserva.addons,
        totalAdicionales: reserva.addonsTotal,
        lanchas: reserva.boatRequests,
        creadaEl: reserva.createdAt,
    };
}

export async function getReservas({
    q,
    estado,
}: FiltrosReservas): Promise<Reserva[]> {
    const token = await requireSessionToken();
    const complejos = await getOwnedComplejos();
    const status = estado ? ESTADO_HACIA_API[estado] : undefined;

    const listas = await Promise.all(
        complejos.map((complejo) => fetchBookings(token, complejo.id, status)),
    );

    const nombrePorComplejo = new Map(
        complejos.map((complejo) => [complejo.id, complejo.nombre]),
    );
    const termino = q?.trim().toLowerCase();

    return listas
        .flat()
        .map((reserva) =>
            mapearResumen(
                reserva,
                nombrePorComplejo.get(reserva.complexId) ?? null,
            ),
        )
        .filter(
            (reserva) =>
                !termino || reserva.huesped.toLowerCase().includes(termino),
        )
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

export async function getReservaById(
    id: string,
): Promise<ReservaDetalle | null> {
    const token = await requireSessionToken();

    try {
        const [reserva, complejos] = await Promise.all([
            fetchBooking(token, id),
            getOwnedComplejos(),
        ]);
        const complejo =
            complejos.find((item) => item.id === reserva.complexId)?.nombre ??
            null;

        return mapearDetalle(reserva, complejo);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function getResumen(): Promise<ResumenReservas> {
    const reservas = await getReservas({});
    const hoy = fechaISOHoy();
    const limite = sumarDias(hoy, 7);

    return {
        pendientes: reservas.filter((reserva) => reserva.estado === "pendiente")
            .length,
        proximosIngresos: reservas.filter(
            (reserva) =>
                reserva.estado !== "cancelada" &&
                reserva.checkIn >= hoy &&
                reserva.checkIn <= limite,
        ).length,
        confirmadas: reservas.filter(
            (reserva) => reserva.estado === "confirmada",
        ).length,
        total: reservas.length,
    };
}

function fechaISOHoy(): string {
    return new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: TIMEZONE,
    }).format(new Date());
}

function sumarDias(iso: string, dias: number): string {
    const [anio, mes, dia] = iso.split("-").map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia));
    fecha.setUTCDate(fecha.getUTCDate() + dias);
    return fecha.toISOString().slice(0, 10);
}
