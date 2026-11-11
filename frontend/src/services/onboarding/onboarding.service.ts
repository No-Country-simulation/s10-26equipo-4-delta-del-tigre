import complejosMock from "@/app/(admin)/complejos/data/complejo.json";

export type AddonPublico = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
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

function buscarComplejoMock(slug: string): ComplejoPublico | null {
    const complejo = complejosMock.find((item) => item.slug === slug);
    if (!complejo) return null;

    return {
        id: complejo.id,
        nombre: complejo.nombre,
        slug,
        direccion: complejo.direccion,
        logo: complejo.logo,
        coloresMarca: complejo.coloresMarca,
        abierto: complejo.estadoOperativo === "abierto",
        addons: [],
    };
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
