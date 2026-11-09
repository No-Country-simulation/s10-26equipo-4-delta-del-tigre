import {
    actualizarAdicionalApi,
    actualizarEstadoAdicionalApi,
    crearAdicionalApi,
    eliminarAdicionalApi,
    obtenerAdicionalesApi,
    type AdicionalPayload,
} from "@/services/adicionales/adicionales.service";

export type Adicional = {
    id: string;
    complejoId: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    activo: boolean;
    imagen: string | null;
};

function valorTexto(valor: unknown): string | null {
    return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : null;
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
            data.image
            ?? data.imagen
            ?? data.imageUrl
            ?? data.imagenUrl
            ?? data.url_imagen,
        ),
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

const MOCK_INICIALES: Adicional[] = [
    {
        id: "addon-001",
        complejoId: "123",
        nombre: "Desayuno isleño",
        descripcion: "Pan de campo, frutas, infusiones y jugo natural.",
        precio: 18500,
        activo: true,
        imagen: "https://picsum.photos/seed/desayuno-isleno/800/450",
    },
    {
        id: "addon-002",
        complejoId: "123",
        nombre: "Paseo en kayak",
        descripcion: "Kayak doble por arroyos tranquilos. Duración: 2 h.",
        precio: 24000,
        activo: true,
        imagen: "https://picsum.photos/seed/kayak-delta/800/450",
    },
    {
        id: "addon-003",
        complejoId: "123",
        nombre: "Cena de bienvenida",
        descripcion: "Menú casero de tres pasos para dos personas.",
        precio: 32000,
        activo: false,
        imagen: "https://picsum.photos/seed/cena-delta/800/450",
    },
    {
        id: "addon-004",
        complejoId: "456",
        nombre: "Traslado en lancha",
        descripcion: "Traslado desde el muelle hasta el complejo.",
        precio: 40000,
        activo: true,
        imagen: "https://picsum.photos/seed/lancha-delta/800/450",
    },
];

const globalForAdicionales = globalThis as unknown as {
    __hostflowAdicionales?: Adicional[];
};
const MOCK_ADICIONALES = globalForAdicionales.__hostflowAdicionales
    ?? MOCK_INICIALES;
globalForAdicionales.__hostflowAdicionales = MOCK_ADICIONALES;

function ordenarAdicionales(adicionales: Adicional[]) {
    return [...adicionales].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function toPayload({ nombre, descripcion, precio, imagen }: AdicionalPayload): AdicionalPayload {
    return { nombre, descripcion, precio, imagen };
}

export async function listarAdicionales(complexId: string): Promise<Adicional[]> {
    const apiAdicionales = await obtenerAdicionalesApi(complexId);
    if (apiAdicionales !== undefined) {
        return ordenarAdicionales(apiAdicionales.map(normalizarAdicional));
    }

    return ordenarAdicionales(
        MOCK_ADICIONALES.filter((adicional) => adicional.complejoId === complexId),
    );
}

export async function obtenerAdicional(
    complexId: string,
    id: string,
): Promise<Adicional | undefined> {
    const adicionales = await listarAdicionales(complexId);
    return adicionales.find((adicional) => adicional.id === id);
}

export async function crearAdicional(
    complexId: string,
    payload: AdicionalPayload,
): Promise<Adicional> {
    const apiAdicional = await crearAdicionalApi(complexId, toPayload(payload));
    if (apiAdicional !== undefined) {
        const adicional = normalizarAdicional(apiAdicional);
        return { ...adicional, complejoId: adicional.complejoId || complexId };
    }

    const adicional: Adicional = {
        id: crypto.randomUUID(),
        complejoId: complexId,
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        precio: payload.precio,
        activo: true,
        imagen: payload.imagen ?? null,
    };
    MOCK_ADICIONALES.push(adicional);
    return adicional;
}

export async function actualizarAdicional(
    id: string,
    payload: AdicionalPayload,
): Promise<Adicional> {
    const apiAdicional = await actualizarAdicionalApi(id, toPayload(payload));
    if (apiAdicional !== undefined) {
        return normalizarAdicional(apiAdicional);
    }

    const adicional = MOCK_ADICIONALES.find((item) => item.id === id);
    if (!adicional) throw new Error("El adicional no existe.");

    adicional.nombre = payload.nombre;
    adicional.descripcion = payload.descripcion;
    adicional.precio = payload.precio;
    if (payload.imagen !== undefined) adicional.imagen = payload.imagen;
    return adicional;
}

export async function cambiarEstadoAdicional(
    id: string,
    activo: boolean,
): Promise<Adicional> {
    const apiAdicional = await actualizarEstadoAdicionalApi(id, activo);
    if (apiAdicional !== undefined) {
        return normalizarAdicional(apiAdicional);
    }

    const adicional = MOCK_ADICIONALES.find((item) => item.id === id);
    if (!adicional) throw new Error("El adicional no existe.");

    adicional.activo = activo;
    return adicional;
}

export async function eliminarAdicional(id: string): Promise<void> {
    const apiResultado = await eliminarAdicionalApi(id);
    if (apiResultado !== undefined) return;

    const index = MOCK_ADICIONALES.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("El adicional no existe.");
    MOCK_ADICIONALES.splice(index, 1);
}
