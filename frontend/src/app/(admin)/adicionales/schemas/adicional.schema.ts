import { z } from "zod";

const NOMBRE_REGEX = /^[\p{Script=Latin}0-9](?:[\p{Script=Latin}\p{M}0-9 '.,&()-]*[\p{Script=Latin}\p{M}0-9.)])?$/u;
const DESCRIPCION_REGEX = /^[\p{Script=Latin}0-9¿¡](?:[\p{Script=Latin}\p{M}0-9 '.,;:&()!?¿¡/%-]*[\p{Script=Latin}\p{M}0-9.!?)%])?$/u;

const nombreSchema = z.string()
    .trim()
    .min(2, "El nombre debe tener entre 2 y 80 caracteres.")
    .max(80, "El nombre debe tener entre 2 y 80 caracteres.")
    .regex(
        NOMBRE_REGEX,
        "El nombre solo admite letras, números, espacios y . , ' & ( ) -, sin espacios al inicio ni al final.",
    );

const descripcionSchema = z.string()
    .trim()
    .max(250, "La descripción no puede superar los 250 caracteres.")
    .refine(
        (valor) => valor === "" || (valor.length >= 3 && DESCRIPCION_REGEX.test(valor)),
        "La descripción debe tener entre 3 y 250 caracteres y no admite espacios al inicio o al final.",
    );

const precioSchema = z.string()
    .trim()
    .min(1, "El precio es obligatorio.")
    .regex(/^\d{1,10}(?:[.,]\d{1,2})?$/, "Ingresá un precio válido con hasta 2 decimales.")
    .transform((valor) => Number(valor.replace(",", ".")))
    .refine((valor) => valor > 0, "El precio debe ser mayor a cero.");

export const adicionalFormSchema = z.object({
    nombre: nombreSchema,
    descripcion: descripcionSchema,
    precio: precioSchema,
});

export type AdicionalFormValues = z.infer<typeof adicionalFormSchema>;

export type AdicionalFormErrors = Partial<
    Record<"nombre" | "descripcion" | "precio" | "imagen" | "form", string>
>;

export type AdicionalFormState = {
    status: "idle" | "error";
    message?: string;
    errors: AdicionalFormErrors;
};

export const IMAGEN_MAX_BYTES = 2 * 1024 * 1024;

export const IMAGEN_ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
] as const;
