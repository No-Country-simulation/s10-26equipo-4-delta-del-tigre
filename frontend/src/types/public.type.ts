
import type { Allergy, BookingStatus } from "@/types/booking.type";

// Configuración pública del complejo
export interface PublicAddonApi {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
}

export interface PublicComplexApi {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    logoUrl: string | null;
    brandColors: string | null;
    open: boolean;
    addons: PublicAddonApi[];
}

// Adicional seleccionado en onboarding
export interface OnboardingAddonInput {
    addonId: string;
    quantity: number;
}

// Solicitud de lancha
export interface OnboardingBoatInput {
    departureAt: string;
    returnAt: string;
    passengers: number;
    pickupPoint?: string;
    comments?: string;
}

// Formulario público de onboarding
export interface OnboardingInput {
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    guestIdentificationType?: string;
    guestIdentificationNumber?: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    preferences?: string;
    allergies?: Allergy[];
    otherAllergies?: string;
    addons?: OnboardingAddonInput[];
    boat?: OnboardingBoatInput;
}

// Información bancaria para el huésped
export interface OnboardingPaymentInfo {
    accountHolder: string;
    aliasCbu: string;
    bank: string;
}

// Respuesta del onboarding
export interface OnboardingResponse {
    bookingId: string;
    status: BookingStatus;
    total: number;
    boatRequested: boolean;
    paymentInfo: OnboardingPaymentInfo | null;
}
