import { ApiError } from "@/lib/api";
import { getSessionToken } from "@/services/auth/session";
import {
    fetchAddons,
    createAddon,
    updateAddon,
    updateAddonStatus,
} from "@/services/adicionales/adicionales.service";
import type { AddonInput } from "@/types/addons.type";

export type Adicional = {
    id: string;
    complejoId: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    activo: boolean;
    imagen: string | null;
};

export type AdicionalPayload = {
    nombre: string;
    descripcion: string | null;
    precio: number;
    imagen?: string | null;
};

async function requireSessionToken(): Promise<string> {
    const token = await getSessionToken();

    if (!token) {
        throw new ApiError(
            "Tu sesión expiró. Iniciá sesión nuevamente.",
            401,
        );
    }

    return token;
}

function valorTexto(valor: unknown): string | null {
    return typeof valor === "string" && valor.trim() !== ""
        ? valor.trim()
        : null;
}

function valorNumero(valor: unknown): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function valorBooleano(valor: unknown): boolean {
    return valor === true || valor === "true" || valor === 1 || valor === "1";
}

export function normalizarAdicional(valor: unknown): Adicional {
    const data = valor && typeof valor === "object"
        ? valor as Record<string, unknown>
        : {};

    return {
        id: String(data.id ?? data.uuid ?? ""),
        complejoId: String(
            data.complexId
            ?? data.complex_id
            ?? data.complejoId
            ?? data.complejo_id
            ?? "",
        ),
        nombre: String(data.name ?? data.nombre ?? ""),
        descripcion: valorTexto(data.description ?? data.descripcion),
        precio: valorNumero(data.price ?? data.precio),
        activo: valorBooleano(data.active ?? data.activo),
        imagen: valorTexto(
            data.imageUrl
            ?? data.image
            ?? data.imagen
            ?? data.imagenUrl
            ?? data.url_imagen,
        ),
    };
}

function mapearPayload(payload: AdicionalPayload): AddonInput {
    return {
        name: payload.nombre,
        description: payload.descripcion ?? undefined,
        price: payload.precio,
        imageUrl: payload.imagen ?? undefined,
    };
}

export function formatearPrecio(precio: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(precio);
}

function ordenarAdicionales(adicionales: Adicional[]) {
    return [...adicionales].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es"),
    );
}

// Obtener todos los adicionales de un complejo
export async function listarAdicionales(
    complexId: string,
): Promise<Adicional[]> {
    const token = await requireSessionToken();
    const adicionales = await fetchAddons(token, complexId);

    return ordenarAdicionales(
        adicionales.map(normalizarAdicional),
    );
}

// Obtener un adicional específico
export async function obtenerAdicional(
    complexId: string,
    id: string,
): Promise<Adicional | undefined> {
    const adicionales = await listarAdicionales(complexId);

    return adicionales.find((adicional) => adicional.id === id);
}

// Crear un adicional
export async function crearAdicional(
    complexId: string,
    payload: AdicionalPayload,
): Promise<Adicional> {
    const token = await requireSessionToken();

    const adicional = await createAddon(
        token,
        complexId,
        mapearPayload(payload),
    );

    const normalizado = normalizarAdicional(adicional);

    return {
        ...normalizado,
        complejoId: normalizado.complejoId || complexId,
    };
}

// Actualizar un adicional
export async function actualizarAdicional(
    id: string,
    payload: AdicionalPayload,
): Promise<Adicional> {
    const token = await requireSessionToken();

    const adicional = await updateAddon(
        token,
        id,
        mapearPayload(payload),
    );

    return normalizarAdicional(adicional);
}

// Activar o desactivar un adicional
export async function cambiarEstadoAdicional(
    id: string,
    activo: boolean,
): Promise<Adicional> {
    const token = await requireSessionToken();

    const adicional = await updateAddonStatus(
        token,
        id,
        { active: activo },
    );

    return normalizarAdicional(adicional);
}
