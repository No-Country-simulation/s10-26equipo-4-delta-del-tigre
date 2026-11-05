export class ComplejoApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly payload: unknown,
    ) {
        super(message);
        this.name = "ComplejoApiError";
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

function getComplejosFromPayload(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.complejos)) return data.complejos;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object") {
        const nested = data.data as Record<string, unknown>;
        if (Array.isArray(nested.complejos)) return nested.complejos;
        if (Array.isArray(nested.items)) return nested.items;
    }
    return [];
}

export async function obtenerComplejosApi(): Promise<unknown[] | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(`${apiUrl}/api/complejos`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        throw new ComplejoApiError(
            `No se pudieron cargar los complejos (${response.status}).`,
            response.status,
            payload,
        );
    }
    return getComplejosFromPayload(payload);
}

export async function obtenerComplejoApi(id: string): Promise<unknown | null | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(`${apiUrl}/api/complejos/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    const payload: unknown = await response.json().catch(() => null);
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new ComplejoApiError(
            `No se pudo cargar el complejo (${response.status}).`,
            response.status,
            payload,
        );
    }
    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>;
        return data.complejo ?? data.data ?? payload;
    }
    return payload;
}

export async function guardarComplejo(id: string | undefined, formData: FormData) {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
        throw new Error("No se ha podido establecer la conexión, revisa tu conexion a internet.");
    }

    const response = await fetch(
        `${apiUrl}/api/complejos${id ? `/${encodeURIComponent(id)}` : ""}`,
        {
            method: id ? "PATCH" : "POST",
            headers: { Accept: "application/json" },
            body: formData,
            cache: "no-store",
        },
    );
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ComplejoApiError(
            `No se pudo guardar el complejo (${response.status}).`,
            response.status,
            payload,
        );
    }

    return payload;
}
