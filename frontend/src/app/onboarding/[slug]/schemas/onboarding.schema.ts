import { z } from "zod";

export function hoyISO() {
    const ahora = new Date();
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
}

export const datosHuespedSchema = z
    .object({
        nombre: z
            .string()
            .trim()
            .min(3, "Ingresá tu nombre y apellido.")
            .max(100, "El nombre no puede superar los 100 caracteres.")
            .regex(
                /^[\p{Script=Latin}\p{M}]+(?:[ '-][\p{Script=Latin}\p{M}]+)*$/u,
                "El nombre contiene caracteres no permitidos.",
            ),
        documento: z
            .string()
            .trim()
            .min(5, "Ingresá tu número de documento.")
            .max(20, "El documento no puede superar los 20 caracteres.")
            .regex(/^[A-Za-z0-9.-]+$/, "El documento contiene caracteres no permitidos."),
        telefono: z
            .string()
            .trim()
            .min(6, "Ingresá tu teléfono.")
            .max(20, "El teléfono no puede superar los 20 caracteres.")
            .regex(/^\+?[0-9][0-9 ()-]{4,18}[0-9]$/, "El teléfono no es válido."),
        email: z
            .string()
            .trim()
            .min(1, "Ingresá tu email.")
            .email("Ingresá un email válido."),
        huespedes: z.coerce
            .number()
            .int("La cantidad de huéspedes debe ser un número entero.")
            .min(1, "Debe haber al menos 1 huésped.")
            .max(10, "La cantidad máxima de huéspedes es 10."),
        llegada: z.string().min(1, "Seleccioná la fecha de llegada."),
        salida: z.string().min(1, "Seleccioná la fecha de salida."),
    })
    .refine((datos) => datos.llegada >= hoyISO(), {
        message: "La fecha de llegada no puede ser anterior a hoy.",
        path: ["llegada"],
    })
    .refine((datos) => datos.salida > datos.llegada, {
        message: "La fecha de salida debe ser posterior a la de llegada.",
        path: ["salida"],
    });

export type DatosHuesped = z.infer<typeof datosHuespedSchema>;

export type DatosHuespedForm = {
    nombre: string;
    documento: string;
    telefono: string;
    email: string;
    huespedes: string;
    llegada: string;
    salida: string;
};

export const ALERGIAS = [
    "GLUTEN",
    "LACTOSA",
    "MANI",
    "FRUTOS_SECOS",
    "HUEVO",
    "SOJA",
    "MARISCOS",
    "PESCADO",
] as const;

export type Alergia = (typeof ALERGIAS)[number];

export const ALERGIAS_OPCIONES: { value: Alergia; label: string }[] = [
    { value: "GLUTEN", label: "Gluten" },
    { value: "LACTOSA", label: "Lactosa" },
    { value: "MANI", label: "Maní" },
    { value: "FRUTOS_SECOS", label: "Frutos secos" },
    { value: "HUEVO", label: "Huevo" },
    { value: "SOJA", label: "Soja" },
    { value: "MARISCOS", label: "Mariscos" },
    { value: "PESCADO", label: "Pescado" },
];

const TEXTO_LIBRE = /^[\p{Script=Latin}\p{M}0-9\s'.,;:&()!?¡¿/%-]*$/u;

export const preferenciasHuespedSchema = z.object({
    alergias: z.array(z.enum(ALERGIAS)),
    otraAlergia: z
        .string()
        .trim()
        .max(500, "El detalle no puede superar los 500 caracteres.")
        .regex(TEXTO_LIBRE, "El texto contiene caracteres no permitidos."),
    preferencias: z
        .string()
        .trim()
        .max(1000, "Las preferencias no pueden superar los 1000 caracteres.")
        .regex(TEXTO_LIBRE, "El texto contiene caracteres no permitidos."),
});

export type PreferenciasHuesped = z.infer<typeof preferenciasHuespedSchema>;

export type PreferenciasHuespedForm = {
    alergias: Alergia[];
    otraAlergia: string;
    preferencias: string;
};

export function ahoraLocalISO() {
    const ahora = new Date();
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
}

export const lanchaSchema = z
    .object({
        necesitaLancha: z.boolean(),
        salidaLancha: z.string(),
        regresoLancha: z.string(),
        pasajerosLancha: z.coerce
            .number()
            .int("La cantidad de pasajeros debe ser un número entero.")
            .min(1, "Debe haber al menos 1 pasajero.")
            .max(10, "La cantidad máxima de pasajeros es 10."),
        puntoSalida: z
            .string()
            .trim()
            .max(200, "El punto de salida no puede superar los 200 caracteres.")
            .regex(TEXTO_LIBRE, "El texto contiene caracteres no permitidos."),
        comentariosLancha: z
            .string()
            .trim()
            .max(500, "Los comentarios no pueden superar los 500 caracteres.")
            .regex(TEXTO_LIBRE, "El texto contiene caracteres no permitidos."),
    })
    .superRefine((datos, ctx) => {
        if (!datos.necesitaLancha) return;

        if (!datos.salidaLancha) {
            ctx.addIssue({
                code: "custom",
                path: ["salidaLancha"],
                message: "Seleccioná la fecha y hora de salida.",
            });
        } else if (datos.salidaLancha <= ahoraLocalISO()) {
            ctx.addIssue({
                code: "custom",
                path: ["salidaLancha"],
                message: "La salida debe ser futura.",
            });
        }

        if (!datos.regresoLancha) {
            ctx.addIssue({
                code: "custom",
                path: ["regresoLancha"],
                message: "Seleccioná la fecha y hora de regreso.",
            });
        } else if (datos.salidaLancha && datos.regresoLancha <= datos.salidaLancha) {
            ctx.addIssue({
                code: "custom",
                path: ["regresoLancha"],
                message: "El regreso debe ser posterior a la salida.",
            });
        }

        if (!datos.puntoSalida) {
            ctx.addIssue({
                code: "custom",
                path: ["puntoSalida"],
                message: "Elegí un punto de salida.",
            });
        }
    });

export type Lancha = z.infer<typeof lanchaSchema>;

export type LanchaForm = {
    necesitaLancha: boolean;
    salidaLancha: string;
    regresoLancha: string;
    pasajerosLancha: string;
    puntoSalida: string;
    comentariosLancha: string;
};
