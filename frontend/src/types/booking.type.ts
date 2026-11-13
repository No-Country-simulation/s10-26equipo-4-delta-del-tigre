
export type BookingStatus =
    | "PENDIENTE"
    | "CONFIRMADA"
    | "FINALIZADA"
    | "CANCELADA";

export type Allergy =
    | "GLUTEN"
    | "LACTOSA"
    | "MANI"
    | "FRUTOS_SECOS"
    | "HUEVO"
    | "SOJA"
    | "MARISCOS"
    | "PESCADO";

export type BoatRequestStatus =
    | "PENDING"
    | "SENT"
    | "FAILED";

// Crear reserva manualmente
export interface CreateBookingInput {
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestIdentificationType?: string;
    guestIdentificationNumber?: string;
    guestEmail?: string;
    guestPhone?: string;
    preferences?: string;
    allergies?: Allergy[];
    otherAllergies?: string;
}

// Resumen de reserva
export interface BookingSummaryApi {
    id: string;
    complexId: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
}

// Respuesta de creación y de actualización de estado
export interface BookingResponseApi {
    id: string;
    complexId: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    guestName: string;
    guestIdentificationType: string | null;
    guestIdentificationNumber: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    preferences: string | null;
    allergies: Allergy[];
    otherAllergies: string | null;
    createdAt: string;
}

// Adicionales incluidos en una reserva
export interface BookingAddonApi {
    addonId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

// Solicitud de lancha
export interface BoatRequestApi {
    id: string;
    departureAt: string;
    returnAt: string;
    pickupPoint: string | null;
    passengers: number;
    comments: string | null;
    status: BoatRequestStatus;
}

// Detalle completo de reserva
export interface BookingApi {
    id: string;
    complexId: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    status: BookingStatus;
    guestName: string;
    guestIdentificationType: string | null;
    guestIdentificationNumber: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    preferences: string | null;
    allergies: Allergy[];
    otherAllergies: string | null;
    addons: BookingAddonApi[];
    addonsTotal: number;
    boatRequests: BoatRequestApi[];
    createdAt: string;
}

// Actualizar estado
export interface UpdateBookingStatusInput {
    status: BookingStatus;
}
