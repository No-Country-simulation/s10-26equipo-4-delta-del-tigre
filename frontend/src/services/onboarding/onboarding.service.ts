import complejosMock from "@/app/(admin)/complejos/data/complejo.json";
import { listarAdicionales } from "@/app/(admin)/adicionales/data/adicionales.data";

export type AddonPublico = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string | null;
};

export type ComplejoPublico = {
    id: string;
    nombre: string;
    slug: string;
    direccion: string;
    logo: string | null;
    coloresMarca: string | null;
    abierto: boolean;
    addons: AddonPublico[];
};

export class OnboardingApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly payload: unknown,
    ) {
        super(message);
        this.name = "OnboardingApiError";
    }
}

function getApiUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
    if (!apiUrl) return undefined;

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(apiUrl);
    } catch {
        throw new Error("NEXT_PUBLIC_API_URL debe ser una URL completa con http:// o https://.");
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("NEXT_PUBLIC_API_URL debe usar http:// o https://.");
    }

    return apiUrl;
}

function valorTexto(valor: unknown): string | null {
    return typeof valor === "string" && valor.trim() !== "" ? valor : null;
}

function valorNumero(valor: unknown): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function normalizarAddons(valor: unknown): AddonPublico[] {
    if (!Array.isArray(valor)) return [];

    return valor
        .filter((addon): addon is Record<string, unknown> => Boolean(addon) && typeof addon === "object")
        .map((addon) => ({
            id: String(addon.id ?? addon.uuid ?? ""),
            nombre: String(addon.nombre ?? addon.name ?? ""),
            descripcion: String(addon.descripcion ?? addon.description ?? ""),
            precio: valorNumero(addon.precio ?? addon.price),
            imagen: valorTexto(
                addon.imagen
                ?? addon.image
                ?? addon.imageUrl
                ?? addon.imagenUrl
                ?? addon.url_imagen,
            ),
        }));
}

export function normalizarComplejoPublico(valor: unknown): ComplejoPublico | null {
    if (!valor || typeof valor !== "object") return null;

    const envoltorio = valor as Record<string, unknown>;
    const data = envoltorio.data && typeof envoltorio.data === "object"
        ? envoltorio.data as Record<string, unknown>
        : envoltorio;
    const slug = valorTexto(data.slug);

    if (!slug) return null;

    return {
        id: String(data.id ?? data.uuid ?? ""),
        nombre: String(data.nombre ?? data.name ?? ""),
        slug,
        direccion: String(data.direccion ?? data.address ?? ""),
        logo: valorTexto(data.logo ?? data.logoUrl ?? data.url_logo),
        coloresMarca: valorTexto(data.coloresMarca ?? data.brandColors ?? data.colores_marca),
        abierto: data.abierto === true || data.open === true || data.publicado === true,
        addons: normalizarAddons(data.addons),
    };
}

function buscarComplejoMock(slug: string): Promise<ComplejoPublico | null> {
    const complejo = complejosMock.find((item) => item.slug === slug);
    if (!complejo) return Promise.resolve(null);

    return listarAdicionales(complejo.id).then((adicionales) => ({
        id: complejo.id,
        nombre: complejo.nombre,
        slug,
        direccion: complejo.direccion,
        logo: complejo.logo,
        coloresMarca: complejo.coloresMarca,
        abierto: complejo.estadoOperativo === "abierto",
        addons: adicionales
            .filter((adicional) => adicional.activo)
            .map((adicional) => ({
                id: adicional.id,
                nombre: adicional.nombre,
                descripcion: adicional.descripcion ?? "",
                precio: adicional.precio,
                imagen: adicional.imagen,
            })),
    }));
}

export async function obtenerComplejoPublicoPorSlug(
    slug: string,
): Promise<ComplejoPublico | null> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return buscarComplejoMock(slug);

    const response = await fetch(
        `${apiUrl}/api/v1/public/complexes/${encodeURIComponent(slug)}`,
        {
            headers: { Accept: "application/json" },
            cache: "no-store",
        },
    );
    const payload: unknown = await response.json().catch(() => null);

    if (response.status === 404) return null;
    if (!response.ok) {
        throw new OnboardingApiError(
            `No se pudo cargar el complejo (${response.status}).`,
            response.status,
            payload,
        );
    }

    return normalizarComplejoPublico(payload);
}

export type OnboardingPayload = {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestIdentificationType: string;
    guestIdentificationNumber: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    preferences?: string;
    allergies: string[];
    otherAllergies?: string;
    addons: { addonId: string; quantity: number }[];
    boat?: {
        departureAt: string;
        returnAt: string;
        passengers: number;
        pickupPoint?: string;
        comments?: string;
    };
};

export type OnboardingResultado = {
    bookingId: string;
    status: string;
    total: number;
    boatRequested: boolean;
    paymentInfo: {
        accountHolder: string;
        aliasCbu: string;
        bank: string;
    } | null;
};

function mensajeDeError(payload: unknown, status: number): string {
    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        if (typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
        if (data.data && typeof data.data === "object") {
            const primero = Object.values(data.data as Record<string, unknown>)
                .find((valor): valor is string => typeof valor === "string" && valor.trim() !== "");
            if (primero) return primero;
        }
    }

    return `No se pudo enviar el onboarding (${status}).`;
}

function normalizarResultado(payload: unknown): OnboardingResultado {
    const envoltorio = payload && typeof payload === "object"
        ? payload as Record<string, unknown>
        : {};
    const data = envoltorio.data && typeof envoltorio.data === "object"
        ? envoltorio.data as Record<string, unknown>
        : envoltorio;
    const paymentInfo = data.paymentInfo && typeof data.paymentInfo === "object"
        ? data.paymentInfo as Record<string, unknown>
        : null;

    return {
        bookingId: String(data.bookingId ?? data.id ?? ""),
        status: String(data.status ?? "PENDIENTE"),
        total: valorNumero(data.total),
        boatRequested: data.boatRequested === true,
        paymentInfo: paymentInfo
            ? {
                accountHolder: String(paymentInfo.accountHolder ?? ""),
                aliasCbu: String(paymentInfo.aliasCbu ?? ""),
                bank: String(paymentInfo.bank ?? ""),
            }
            : null,
    };
}

export async function enviarOnboarding(
    slug: string,
    payload: OnboardingPayload,
): Promise<OnboardingResultado> {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const complejo = await buscarComplejoMock(slug);
        const complejoMock = complejosMock.find((item) => item.slug === slug);
        const total = payload.addons.reduce((suma, item) => {
            const addon = complejo?.addons.find((candidato) => candidato.id === item.addonId);
            return suma + (addon?.precio ?? 0) * item.quantity;
        }, 0);

        return {
            bookingId: `DS-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "PENDIENTE",
            total,
            boatRequested: Boolean(payload.boat),
            paymentInfo: complejoMock?.aliasCbu
                ? {
                    accountHolder: complejoMock.titularCuenta ?? "",
                    aliasCbu: complejoMock.aliasCbu,
                    bank: complejoMock.banco ?? "",
                }
                : null,
        };
    }

    const response = await fetch(
        `${apiUrl}/api/v1/public/complexes/${encodeURIComponent(slug)}/onboarding`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        },
    );
    const respuesta: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        throw new OnboardingApiError(
            mensajeDeError(respuesta, response.status),
            response.status,
            respuesta,
        );
    }

    return normalizarResultado(respuesta);
}
