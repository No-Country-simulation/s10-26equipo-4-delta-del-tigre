import complejos from "./complejo.json";
import { obtenerComplejoApi, obtenerComplejosApi } from "../../../../services/complejos/complejos.service";

export type Complejo = {
    id: string;
    ownerId: string;
    nombre: string;
    direccion: string;
    logo: string | null;
    coloresMarca: string | null;
    maxPersonas: number | null;
    minPersonas: number | null;
    maxReservas: number | null;
    slug: string | null;
    titularCuenta: string | null;
    aliasCbu: string | null;
    banco: string | null;
    cuenta: string | null;
    publicado: boolean;
    estadoOperativo: "abierto" | "cerrado" | null;
};

export type EstadoComplejo =
    | "sin-configurar"
    | "faltan-datos"
    | "completado"
    | "sin-publicar"
    | "abierto"
    | "cerrado";

export const ESTADOS_COMPLEJO: { value: EstadoComplejo; label: string }[] = [
    { value: "sin-publicar", label: "Sin publicar" },
    { value: "sin-configurar", label: "Sin configurar" },
    { value: "faltan-datos", label: "Faltan datos" },
    { value: "completado", label: "Completado" },
    { value: "abierto", label: "Abierto" },
    { value: "cerrado", label: "Cerrado" },
];

const MOCK_OWNER_ID = "user-001";
const CAMPOS_CONFIGURACION: (keyof Pick<
    Complejo,
    | "logo"
    | "maxPersonas"
    | "minPersonas"
    | "maxReservas"
    | "slug"
    | "titularCuenta"
    | "aliasCbu"
    | "banco"
>)[] = [
    "logo",
    "maxPersonas",
    "minPersonas",
    "maxReservas",
    "slug",
    "titularCuenta",
    "aliasCbu",
    "banco",
];

function valorTexto(valor: unknown): string | null {
    return typeof valor === "string" && valor !== "" ? valor : null;
}

function valorNumero(valor: unknown): number | null {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

export function normalizarComplejo(valor: unknown): Complejo {
    const data = valor && typeof valor === "object"
        ? valor as Record<string, unknown>
        : {};
    const publicado = data.publicado ?? data.published;
    const estadoOperativo = data.estadoOperativo ?? data.estado_operativo;

    return {
        id: String(data.id ?? data.uuid ?? ""),
        ownerId: String(data.ownerId ?? data.owner_id ?? data.dueno_id ?? ""),
        nombre: String(data.nombre ?? data.name ?? ""),
        direccion: String(data.direccion ?? data.address ?? ""),
        logo: valorTexto(data.logo ?? data.url_logo ?? data.logoUrl),
        coloresMarca: valorTexto(data.coloresMarca ?? data.colores_marca),
        maxPersonas: valorNumero(data.maxPersonas ?? data.max_personas),
        minPersonas: valorNumero(data.minPersonas ?? data.min_personas),
        maxReservas: valorNumero(data.maxReservas ?? data.max_reservas),
        slug: valorTexto(data.slug),
        titularCuenta: valorTexto(data.titularCuenta ?? data.titular_cuenta),
        aliasCbu: valorTexto(data.aliasCbu ?? data.alias_cbu),
        banco: valorTexto(data.banco),
        cuenta: valorTexto(data.cuenta ?? data.numero_cuenta),
        publicado: publicado === true || publicado === "true" || publicado === 1,
        estadoOperativo: estadoOperativo === "abierto" || estadoOperativo === "cerrado"
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
    if (!complejo.publicado) return "sin-publicar";
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

export async function getOwnedComplejos(): Promise<Complejo[]> {
    const apiComplejos = await obtenerComplejosApi();
    if (apiComplejos !== undefined) return apiComplejos.map(normalizarComplejo);

    return (complejos as Complejo[]).filter(
        (complejo) => complejo.ownerId === MOCK_OWNER_ID,
    );
}

export async function getOwnedComplejo(id: string): Promise<Complejo | undefined> {
    const apiComplejo = await obtenerComplejoApi(id);
    if (apiComplejo !== undefined) {
        return apiComplejo === null ? undefined : normalizarComplejo(apiComplejo);
    }

    return (complejos as Complejo[]).find(
        (complejo) => complejo.id === id && complejo.ownerId === MOCK_OWNER_ID,
    );
}
