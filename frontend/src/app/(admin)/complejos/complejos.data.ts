import complejos from "./data/complejo.json";

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

export function getOwnedComplejos(): Complejo[] {
    return (complejos as Complejo[]).filter(
        (complejo) => complejo.ownerId === MOCK_OWNER_ID,
    );
}

export function getOwnedComplejo(id: string): Complejo | undefined {
    return getOwnedComplejos().find((complejo) => complejo.id === id);
}
