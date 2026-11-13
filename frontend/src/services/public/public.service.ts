
import { ApiError } from "@/lib/api";
import type { Allergy } from "@/types/booking.type";
import {
    createOnboarding,
    fetchPublicComplex,
} from "@/services/onboarding/onboarding.service";
import type {
    OnboardingInput,
    OnboardingResponse,
    PublicComplexApi,
} from "@/types/public.type";

// Modelo que utiliza el OnboardingWizard
export interface ComplejoPublico {
    id: string;
    nombre: string;
    direccion: string | null;
    logo: string | null;
    coloresMarca: string | null;
    slug: string;
    addons: {
        id: string;
        nombre: string;
        descripcion: string | null;
        precio: number;
        imagen: string | null;
    }[];
}

// Payload que construye el formulario
export interface OnboardingPayload {
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
    addons?: {
        addonId: string;
        quantity: number;
    }[];
    boat?: {
        departureAt: string;
        returnAt: string;
        passengers: number;
        pickupPoint?: string;
        comments?: string;
    };
}

// Resultado que consume la pantalla final
export interface OnboardingResultado {
    bookingId: string;
    status: OnboardingResponse["status"];
    total: number;
    boatRequested: boolean;
    paymentInfo: OnboardingResponse["paymentInfo"];
}

function mapearComplejo(
    complejo: PublicComplexApi,
): ComplejoPublico {
    return {
        id: complejo.id,
        nombre: complejo.name,
        direccion: complejo.address,
        logo: complejo.logoUrl,
        coloresMarca: complejo.brandColors,
        slug: complejo.slug,
        addons: complejo.addons.map((addon) => ({
            id: addon.id,
            nombre: addon.name,
            descripcion: addon.description,
            precio: addon.price,
            imagen: addon.imageUrl,
        })),
    };
}

function mapearPayload(
    payload: OnboardingPayload,
): OnboardingInput {
    return {
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
        guestPhone: payload.guestPhone,
        guestIdentificationType: payload.guestIdentificationType,
        guestIdentificationNumber: payload.guestIdentificationNumber,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        guestsCount: payload.guestsCount,
        preferences: payload.preferences,
        allergies: payload.allergies,
        otherAllergies: payload.otherAllergies,
        addons: payload.addons,
        boat: payload.boat,
    };
}

function mapearResultado(
    resultado: OnboardingResponse,
): OnboardingResultado {
    return {
        bookingId: resultado.bookingId,
        status: resultado.status,
        total: resultado.total,
        boatRequested: resultado.boatRequested,
        paymentInfo: resultado.paymentInfo,
    };
}

// Obtiene la configuración pública del complejo
export async function obtenerComplejoPublico(
    slug: string,
): Promise<ComplejoPublico | null> {
    try {
        const complejo = await fetchPublicComplex(slug);
        return mapearComplejo(complejo);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

// Envía el formulario público
export async function enviarOnboarding(
    slug: string,
    payload: OnboardingPayload,
): Promise<OnboardingResultado> {
    const resultado = await createOnboarding(
        slug,
        mapearPayload(payload),
    );

    return mapearResultado(resultado);
}
