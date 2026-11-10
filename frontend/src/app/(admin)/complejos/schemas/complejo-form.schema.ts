
import { z } from "zod";

// Nombre del complejo
const nombreSchema = z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres.")
    .regex(
        /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9][ A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9'-]*(?<=[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9])$/,
        "El nombre contiene caracteres no permitidos o espacios al inicio o al final."
    );

// Dirección
const direccionSchema = z.string()
    .min(3, "La dirección debe tener al menos 3 caracteres.")
    .max(200, "La dirección no puede superar los 200 caracteres.")
    .regex(
        /^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9][ A-Za-zÁÉÍÓÚáéíóúÜüÑñ0-9#.,/-]*$/,
        "La dirección contiene caracteres no permitidos o espacios al inicio o al final."
    );

// Slug obligatorio
const slugSchema = z.string()
    .min(2, "El slug debe tener al menos 2 caracteres.")
    .max(80, "El slug no puede superar los 80 caracteres.")
    .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Usá minúsculas, números y guiones. No uses guiones al inicio, al final ni consecutivos."
    );

// Números enteros obligatorios
const enteroObligatorio = z.preprocess(
    (valor) => valor === "" || valor == null
        ? undefined
        : Number(valor),
    z.number({
        error: "Este campo es obligatorio."
    })
        .int("Ingresá un número entero.")
        .min(1, "El valor debe ser mayor o igual a 1.")
);

// Texto opcional
const textoOpcional = z.string()
    .trim()
    .max(120, "El texto es demasiado largo.");

export const complejoFormSchema = z.object({
    nombre: nombreSchema,
    direccion: direccionSchema,

    estadoOperativo: z.enum(["abierto", "cerrado"]),

    slug: slugSchema,

    coloresMarca: z.union([
        z.literal(""),
        z.string().regex(
            /^#[\da-f]{6}$/i,
            "Seleccioná un color hexadecimal válido."
        )
    ]),

    minPersonas: enteroObligatorio,
    maxPersonas: enteroObligatorio,
    maxReservas: enteroObligatorio,

    titularCuenta: textoOpcional,
    aliasCbu: textoOpcional,
    banco: textoOpcional,
    cuenta: textoOpcional,

}).refine(
    (datos) => datos.minPersonas <= datos.maxPersonas,
    {
        message: "La capacidad mínima no puede superar la máxima.",
        path: ["minPersonas"],
    }
);

export type ComplejoFormValues = z.infer<typeof complejoFormSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const LOGO_ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png"
] as const;
