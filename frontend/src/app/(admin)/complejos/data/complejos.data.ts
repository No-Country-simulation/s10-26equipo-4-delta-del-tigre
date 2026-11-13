import { ApiError } from "@/lib/api";
import { getSessionToken } from "@/services/auth/session";
import {
    fetchComplex,
    fetchComplexes,
} from "@/services/complejos/complejos.service";
import type { PaymentInfoInput } from "@/types/complejo.types";
import { updateComplexPaymentInfo } from "@/services/complejos/complejos.service";
export type Complejo = {
    id: string;
    nombre: string;
    direccion: string;
    logo: string | null;
    coloresMarca: string | null;
    slug: string | null;
    titularCuenta: string | null;
    aliasCbu: string | null;
    banco: string | null;
    estadoOperativo: "abierto" | "cerrado" | null;
};

export type EstadoComplejo =
    | "sin-configurar"
    | "faltan-datos"
    | "completado"
    | "abierto"
    | "cerrado";

export const ESTADOS_COMPLEJO: { value: EstadoComplejo; label: string }[] = [
    { value: "abierto", label: "Abierto" },
    { value: "cerrado", label: "Cerrado" },
    { value: "completado", label: "Completado" },
    { value: "faltan-datos", label: "Faltan datos" },
    { value: "sin-configurar", label: "Sin configurar" },
];

const CAMPOS_CONFIGURACION: (keyof Pick<
    Complejo,
    "direccion" | "coloresMarca" | "titularCuenta" | "aliasCbu" | "banco"
>)[] = ["direccion", "coloresMarca", "titularCuenta", "aliasCbu", "banco"];

function valorTexto(valor: unknown): string | null {
    return typeof valor === "string" && valor !== "" ? valor : null;
}

export function normalizarComplejo(valor: unknown): Complejo {
    const data = valor && typeof valor === "object"
        ? valor as Record<string, unknown>
        : {};
    const estadoOperativo = data.open ?? data.estadoOperativo;

    return {
        id: String(data.id ?? ""),
        nombre: String(data.name ?? data.nombre ?? ""),
        direccion: valorTexto(data.address ?? data.direccion) ?? "",
        logo: valorTexto(data.logoUrl ?? data.logo),
        coloresMarca: valorTexto(data.brandColors ?? data.coloresMarca),
        slug: valorTexto(data.slug),
        titularCuenta: valorTexto(data.accountHolder ?? data.titularCuenta),
        aliasCbu: valorTexto(data.aliasCbu),
        banco: valorTexto(data.bank ?? data.banco),
        estadoOperativo: typeof estadoOperativo === "boolean"
            ? estadoOperativo ? "abierto" : "cerrado"
            : estadoOperativo === "abierto" || estadoOperativo === "cerrado"
                ? estadoOperativo
                : null,
    };
}

export function getEstadoConfiguracion(complejo: Complejo): EstadoComplejo {
    const camposCompletos = CAMPOS_CONFIGURACION.filter((campo) => {
        const valor = complejo[campo];
        return valor !== null && valor !== "";
    }).length;

    if (camposCompletos === 0) return "sin-configurar";
    if (camposCompletos < CAMPOS_CONFIGURACION.length) return "faltan-datos";
    return "completado";
}

export function getEstadoComplejo(complejo: Complejo): EstadoComplejo {
    const estadoConfiguracion = getEstadoConfiguracion(complejo);
    if (estadoConfiguracion !== "completado") return estadoConfiguracion;
    return complejo.estadoOperativo ?? "completado";
}

export function tieneEstadoComplejo(
    complejo: Complejo,
    estado: EstadoComplejo,
): boolean {
    return getEstadoComplejo(complejo) === estado;
}

export function esEstadoComplejo(valor: unknown): valor is EstadoComplejo {
    return ESTADOS_COMPLEJO.some((estado) => estado.value === valor);
}

async function requireSessionToken(): Promise<string> {
    const token = await getSessionToken();
    if (!token) {
        throw new ApiError("Tu sesión expiró. Iniciá sesión nuevamente.", 401);
    }
    return token;
}

export async function getOwnedComplejos(): Promise<Complejo[]> {
    const token = await requireSessionToken();
    const complejos = await fetchComplexes(token);
    return complejos.map(normalizarComplejo);
}

export async function getOwnedComplejo(id: string): Promise<Complejo | undefined> {
    const token = await requireSessionToken();

    try {
        return normalizarComplejo(await fetchComplex(token, id));
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return undefined;
        throw error;
    }
}


export async function actualizarDatosPago(
    complexId: string,
    payload: PaymentInfoInput,
): Promise<Complejo> {
    const token = await requireSessionToken();

    const complejo = await updateComplexPaymentInfo(
        token,
        complexId,
        payload,
    );

    return normalizarComplejo(complejo);
}