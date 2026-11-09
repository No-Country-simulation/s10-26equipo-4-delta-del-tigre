export class AdicionalApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly payload: unknown,
    ) {
        super(message);
        this.name = "AdicionalApiError";
    }
}

export type AdicionalPayload = {
    nombre: string;
    descripcion: string | null;
    precio: number;
    imagen?: string | null;
};

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

function getAdicionalesFromPayload(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.addons)) return data.addons;
    if (Array.isArray(data.adicionales)) return data.adicionales;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (data.data && typeof data.data === "object") {
        const nested = data.data as Record<string, unknown>;
        if (Array.isArray(nested.addons)) return nested.addons;
        if (Array.isArray(nested.adicionales)) return nested.adicionales;
        if (Array.isArray(nested.items)) return nested.items;
    }
    return [];
}

function getAdicionalFromPayload(payload: unknown): unknown {
    if (!payload || typeof payload !== "object") return payload;
    const data = payload as Record<string, unknown>;
    return data.addon ?? data.adicional ?? data.data ?? payload;
}

function toRequestBody({ nombre, descripcion, precio, imagen }: AdicionalPayload) {
    return JSON.stringify({
        name: nombre,
        description: descripcion && descripcion.length > 0 ? descripcion : null,
        price: precio,
        ...(imagen !== undefined ? { image: imagen } : {}),
    });
}

async function parsePayload(response: Response): Promise<unknown> {
    return response.json().catch(() => null);
}

export async function obtenerAdicionalesApi(complexId: string): Promise<unknown[] | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(
        `${apiUrl}/api/v1/complexes/${encodeURIComponent(complexId)}/addons`,
        {
            headers: { Accept: "application/json" },
            cache: "no-store",
        },
    );
    const payload = await parsePayload(response);
    if (!response.ok) {
        throw new AdicionalApiError(
            `No se pudieron cargar los adicionales (${response.status}).`,
            response.status,
            payload,
        );
    }
    return getAdicionalesFromPayload(payload);
}

export async function crearAdicionalApi(
    complexId: string,
    adicional: AdicionalPayload,
): Promise<unknown | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(
        `${apiUrl}/api/v1/complexes/${encodeURIComponent(complexId)}/addons`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: toRequestBody(adicional),
            cache: "no-store",
        },
    );
    const payload = await parsePayload(response);
    if (!response.ok) {
        throw new AdicionalApiError(
            `No se pudo crear el adicional (${response.status}).`,
            response.status,
            payload,
        );
    }
    return getAdicionalFromPayload(payload);
}

export async function actualizarAdicionalApi(
    id: string,
    adicional: AdicionalPayload,
): Promise<unknown | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(`${apiUrl}/api/v1/addons/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: toRequestBody(adicional),
        cache: "no-store",
    });
    const payload = await parsePayload(response);
    if (!response.ok) {
        throw new AdicionalApiError(
            `No se pudo actualizar el adicional (${response.status}).`,
            response.status,
            payload,
        );
    }
    return getAdicionalFromPayload(payload);
}

export async function actualizarEstadoAdicionalApi(
    id: string,
    activo: boolean,
): Promise<unknown | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(
        `${apiUrl}/api/v1/addons/${encodeURIComponent(id)}/status`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ active: activo }),
            cache: "no-store",
        },
    );
    const payload = await parsePayload(response);
    if (!response.ok) {
        throw new AdicionalApiError(
            `No se pudo actualizar el estado del adicional (${response.status}).`,
            response.status,
            payload,
        );
    }
    return getAdicionalFromPayload(payload);
}

export async function eliminarAdicionalApi(id: string): Promise<unknown | undefined> {
    const apiUrl = getApiUrl();
    if (!apiUrl) return undefined;

    const response = await fetch(`${apiUrl}/api/v1/addons/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });
    const payload = await parsePayload(response);
    if (!response.ok) {
        throw new AdicionalApiError(
            `No se pudo eliminar el adicional (${response.status}).`,
            response.status,
            payload,
        );
    }
    return payload;
}
