
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import {
    actualizarAdicional,
    cambiarEstadoAdicional,
    crearAdicional,
} from "./data/adicionales.data";

import {
    adicionalFormSchema,
    IMAGEN_ACCEPTED_TYPES,
    IMAGEN_MAX_BYTES,
    type AdicionalFormErrors,
    type AdicionalFormState,
} from "./schemas/adicional.schema";

const FIELD_NAMES: Record<string, keyof AdicionalFormErrors> = {
    name: "nombre",
    nombre: "nombre",
    description: "descripcion",
    descripcion: "descripcion",
    price: "precio",
    precio: "precio",
    imageurl: "imagen",
    imagen: "imagen",
};

function getServerErrors(payload: unknown): AdicionalFormErrors {
    const errors: AdicionalFormErrors = {};

    if (!payload || typeof payload !== "object") {
        return errors;
    }

    const root = payload as Record<string, unknown>;

    // El backend devuelve las validaciones dentro de data.
    const nestedData =
        root.data && typeof root.data === "object" && !Array.isArray(root.data)
            ? root.data as Record<string, unknown>
            : undefined;

    const validation =
        root.errors ??
        root.fieldErrors ??
        nestedData?.errors ??
        nestedData?.fieldErrors ??
        nestedData;

    if (
        validation &&
        typeof validation === "object" &&
        !Array.isArray(validation)
    ) {
        for (const [field, rawMessages] of Object.entries(validation)) {
            const name = FIELD_NAMES[field.toLowerCase()];
            const messages = Array.isArray(rawMessages)
                ? rawMessages
                : [rawMessages];

            const message = messages.find(
                (entry): entry is string => typeof entry === "string",
            );

            if (name && message) {
                errors[name] = message;
            } else if (message) {
                errors.form = message;
            }
        }
    } else if (Array.isArray(validation)) {
        for (const entry of validation) {
            if (typeof entry === "string") {
                errors.form = entry;
                continue;
            }

            if (!entry || typeof entry !== "object") continue;

            const error = entry as Record<string, unknown>;
            const field = error.field ?? error.name;
            const message =
                error.message ?? error.defaultMessage ?? error.detail;

            const name =
                typeof field === "string"
                    ? FIELD_NAMES[field.toLowerCase()]
                    : undefined;

            if (typeof message === "string" && name) {
                errors[name] = message;
            } else if (typeof message === "string") {
                errors.form = message;
            }
        }
    }

    if (typeof root.message === "string" && !errors.form) {
        errors.form = root.message;
    }

    return errors;
}

function getApiErrorPayload(error: ApiError): unknown {
    // Permite adaptar la extracción al formato de ApiError
    // sin asumir que siempre tiene una propiedad payload.
    const data = error as unknown as Record<string, unknown>;

    return data.payload ?? data.data ?? data.body;
}

async function fileToDataUrl(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function guardarAdicional(
    _previousState: AdicionalFormState,
    formData: FormData,
): Promise<AdicionalFormState> {
    const complexId = String(formData.get("complexId") ?? "").trim();
    const id = String(formData.get("id") ?? "").trim();

    const raw = {
        nombre: String(formData.get("nombre") ?? ""),
        descripcion: String(formData.get("descripcion") ?? ""),
        precio: String(formData.get("precio") ?? ""),
    };

    const validation = adicionalFormSchema.safeParse(raw);

    if (!validation.success) {
        const errors: AdicionalFormErrors = {};

        for (const issue of validation.error.issues) {
            const field = issue.path[0];

            if (typeof field === "string" && field in FIELD_NAMES) {
                const name = FIELD_NAMES[field];

                if (name && !errors[name]) {
                    errors[name] = issue.message;
                }
            } else if (!errors.form) {
                errors.form = issue.message;
            }
        }

        return { status: "error", errors };
    }

    if (!complexId) {
        return {
            status: "error",
            errors: {
                form: "Seleccioná un complejo para guardar el adicional.",
            },
        };
    }

    const imagenValue = formData.get("imagen");

    let imagen: string | null | undefined;

    if (imagenValue instanceof File && imagenValue.size > 0) {
        if (
            !IMAGEN_ACCEPTED_TYPES.includes(
                imagenValue.type as typeof IMAGEN_ACCEPTED_TYPES[number],
            )
        ) {
            return {
                status: "error",
                errors: {
                    imagen: "La imagen debe ser un archivo PNG o JPG.",
                },
            };
        }

        if (imagenValue.size > IMAGEN_MAX_BYTES) {
            return {
                status: "error",
                errors: {
                    imagen: `La imagen no puede superar ${IMAGEN_MAX_BYTES / (1024 * 1024)} MB.`,
                },
            };
        }

        imagen = await fileToDataUrl(imagenValue);
    } else if (
        typeof imagenValue === "string" &&
        imagenValue.trim() !== ""
    ) {
        const imagenUrl = imagenValue.trim();

        if (!/^(https?:\/\/|data:image\/)/i.test(imagenUrl)) {
            return {
                status: "error",
                errors: {
                    imagen: "La URL de la imagen no es válida.",
                },
            };
        }

        imagen = imagenUrl;
    }

    const payload = {
        nombre: validation.data.nombre,
        descripcion: validation.data.descripcion || null,
        precio: validation.data.precio,
        imagen: imagen ?? null,
    };

    try {
        if (id) {
            await actualizarAdicional(id, {
                ...payload,
                imagen: imagen,
            });
        } else {
            await crearAdicional(complexId, payload);
        }
    } catch (error) {
        if (error instanceof ApiError) {
            const errors = getServerErrors(getApiErrorPayload(error));

            return {
                status: "error",
                message: Object.keys(errors).length > 0
                    ? undefined
                    : error.message,
                errors,
            };
        }

        return {
            status: "error",
            errors: {
                form: error instanceof Error
                    ? error.message
                    : "No se pudo guardar el adicional. Intentá nuevamente.",
            },
        };
    }

    revalidatePath("/adicionales");

    redirect(
        `/adicionales?complejo=${encodeURIComponent(complexId)}&${id ? "guardado" : "creado"}=1`,
    );
}

export async function actualizarEstadoAdicional(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    const complexId = String(formData.get("complejo") ?? "").trim();
    const activo = formData.get("activo") === "true";

    if (!id) {
        redirect("/adicionales?error=1");
    }

    try {
        await cambiarEstadoAdicional(id, activo);
    } catch {
        redirect(
            `/adicionales?complejo=${encodeURIComponent(complexId)}&error=1`,
        );
    }

    revalidatePath("/adicionales");

    redirect(
        `/adicionales?complejo=${encodeURIComponent(complexId)}&estado=1`,
    );
}

// Se conserva temporalmente para evitar romper imports existentes.
// El backend todavía no dispone de DELETE.
export async function eliminarAdicional(formData: FormData) {
    const complexId = String(formData.get("complejo") ?? "").trim();

    redirect(
        `/adicionales?complejo=${encodeURIComponent(complexId)}&eliminacion-no-disponible=1`,
    );
}
