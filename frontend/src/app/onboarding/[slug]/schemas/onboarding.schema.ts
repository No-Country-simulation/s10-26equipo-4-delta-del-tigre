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
