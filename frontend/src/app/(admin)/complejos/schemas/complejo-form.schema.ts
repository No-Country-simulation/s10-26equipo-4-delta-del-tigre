import { z } from "zod";

const enteroOpcional = z.preprocess(
    (valor) => valor === "" || valor == null ? null : Number(valor),
    z.number().int("Ingresá un número entero.").min(1, "El valor debe ser mayor a cero.").nullable(),
);

const textoOpcional = z.string().trim().max(120, "El texto es demasiado largo.");

export const complejoFormSchema = z.object({
    nombre: z.string().trim().min(2, "Ingresá un nombre de al menos 2 caracteres.").max(100),
    direccion: z.string().trim().min(3, "Ingresá una dirección válida.").max(200),
    estadoOperativo: z.enum(["abierto", "cerrado"]),
    slug: z.union([
        z.literal(""),
        z.string().trim().max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones.")
    ]),
    coloresMarca: z.union([
        z.literal(""),
        z.string().regex(/^#[\da-f]{6}$/i, "Seleccioná un color hexadecimal válido.")
    ]),
    minPersonas: enteroOpcional,
    maxPersonas: enteroOpcional,
    maxReservas: enteroOpcional,
    titularCuenta: textoOpcional,
    aliasCbu: textoOpcional,
    banco: textoOpcional,
    cuenta: textoOpcional,
}).refine(
    (datos) => datos.minPersonas == null || datos.maxPersonas == null || datos.minPersonas <= datos.maxPersonas,
    {
        message: "La capacidad mínima no puede superar la máxima.",
        path: ["minPersonas"],
    },
);

export type ComplejoFormValues = z.infer<typeof complejoFormSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_ACCEPTED_TYPES = ["image/jpeg", "image/png"] as const;
