import { z } from "zod";

const NAME_REGEX =
  /^[\p{Script=Latin}0-9](?:[\p{Script=Latin}\p{M}0-9 '.&-]*[\p{Script=Latin}\p{M}0-9.])?$/u;
const ADDRESS_REGEX =
  /^[\p{Script=Latin}0-9](?:[\p{Script=Latin}\p{M}0-9 '.,#/°-]*[\p{Script=Latin}\p{M}0-9.])?$/u;
const ALIAS_CBU_REGEX = /^(\d{22}|[A-Za-z0-9.-]{6,20})$/;
const BANK_NAME_REGEX = /^[\p{L}0-9 .&'-]{2,80}$/u;
const CLOUDINARY_URL_REGEX = /^https:\/\/res\.cloudinary\.com\/\S+$/;

const nombreSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres.")
  .max(150, "El nombre no puede superar los 150 caracteres.")
  .regex(
    NAME_REGEX,
    "El nombre solo admite letras, números, espacios, apóstrofes, puntos, guiones y &, sin espacios al inicio ni al final.",
  );

const direccionSchema = z
  .string()
  .min(5, "La dirección debe tener al menos 5 caracteres.")
  .max(255, "La dirección no puede superar los 255 caracteres.")
  .regex(
    ADDRESS_REGEX,
    "La dirección contiene caracteres no permitidos o espacios al inicio o al final.",
  );

const textoOpcional = (schema: z.ZodString) =>
  z.union([z.literal(""), schema]);

export const complejoFormSchema = z
  .object({
    nombre: nombreSchema,
    direccion: direccionSchema,
    coloresMarca: z.union([
      z.literal(""),
      z
        .string()
        .regex(/^#[\da-f]{6}$/i, "Seleccioná un color hexadecimal válido."),
    ]),
    logoUrl: z.union([
      z.literal(""),
      z
        .string()
        .max(500, "La URL del logo no puede superar los 500 caracteres.")
        .regex(
          CLOUDINARY_URL_REGEX,
          "El logo debe ser una URL de Cloudinary (https://res.cloudinary.com/...).",
        ),
    ]),
    estadoOperativo: z.enum(["abierto", "cerrado"]),
    titularCuenta: textoOpcional(nombreSchema),
    aliasCbu: textoOpcional(
      z
        .string()
        .regex(
          ALIAS_CBU_REGEX,
          "Ingresá un CBU de 22 dígitos o un alias de 6 a 20 caracteres (letras, números, puntos o guiones).",
        ),
    ),
    banco: textoOpcional(
      z
        .string()
        .regex(
          BANK_NAME_REGEX,
          "El banco solo admite letras, números, espacios y . & ' - (entre 2 y 80 caracteres).",
        ),
    ),
  })
  .superRefine((data, ctx) => {
    const valores = [data.titularCuenta, data.aliasCbu, data.banco];
    const completos = valores.filter((valor) => valor !== "").length;

    if (completos === 0 || completos === 3) return;

    const campos: [keyof typeof data, string][] = [
      ["titularCuenta", "titularCuenta"],
      ["aliasCbu", "aliasCbu"],
      ["banco", "banco"],
    ];

    for (const [campo, path] of campos) {
      if (!data[campo]) {
        ctx.addIssue({
          code: "custom",
          path: [path],
          message: "Completá los tres datos de pago o dejá los tres vacíos.",
        });
      }
    }
  });

export type ComplejoFormValues = z.infer<typeof complejoFormSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
