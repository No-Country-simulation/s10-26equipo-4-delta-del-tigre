"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AdicionalApiError } from "@/services/adicionales/adicionales.service";
import {
    actualizarAdicional,
    cambiarEstadoAdicional,
    crearAdicional,
    eliminarAdicional as eliminarAdicionalData,
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
};

function getServerErrors(payload: unknown): AdicionalFormErrors {
    const errors: AdicionalFormErrors = {};
    if (!payload || typeof payload !== "object") return errors;

    const data = payload as Record<string, unknown>;
    const validation = data.errors ?? data.fieldErrors;

    if (validation && typeof validation === "object" && !Array.isArray(validation)) {
        for (const [field, rawMessages] of Object.entries(validation)) {
            const name = FIELD_NAMES[field.toLowerCase()];
            const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
            const message = messages.find((entry): entry is string => typeof entry === "string");
            if (name && message) errors[name] = message;
            else if (message) errors.form = message;
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
            const message = error.message ?? error.defaultMessage ?? error.detail;
            const name = typeof field === "string" ? FIELD_NAMES[field.toLowerCase()] : undefined;
            if (typeof message === "string" && name) errors[name] = message;
            else if (typeof message === "string") errors.form = message;
        }
    }

    for (const key of ["message", "detail", "title"]) {
        if (typeof data[key] === "string" && !errors.form) {
            errors.form = data[key] as string;
        }
    }

    return errors;
}

async function fileToDataUrl(file: File) {
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
                if (name && !errors[name]) errors[name] = issue.message;
            } else if (!errors.form) {
                errors.form = issue.message;
            }
        }
        return { status: "error", errors };
    }

    if (!complexId) {
        return {
            status: "error",
            errors: { form: "Seleccioná un complejo para guardar el adicional." },
        };
    }

    const imagenFile = formData.get("imagen");
    let imagen: string | null | undefined;
    if (imagenFile instanceof File && imagenFile.size > 0) {
        if (!IMAGEN_ACCEPTED_TYPES.includes(imagenFile.type as typeof IMAGEN_ACCEPTED_TYPES[number])) {
            return {
                status: "error",
                errors: { imagen: "La imagen debe ser un archivo PNG o JPG." },
            };
        }
        if (imagenFile.size > IMAGEN_MAX_BYTES) {
            return {
                status: "error",
                errors: {
                    imagen: `La imagen no puede superar ${IMAGEN_MAX_BYTES / (1024 * 1024)} MB.`,
                },
            };
        }
        imagen = await fileToDataUrl(imagenFile);
    }

    const payload = {
        nombre: validation.data.nombre,
        descripcion: validation.data.descripcion || null,
        precio: validation.data.precio,
        imagen: id ? imagen : imagen ?? null,
    };

    try {
        if (id) {
            await actualizarAdicional(id, payload);
        } else {
            await crearAdicional(complexId, payload);
        }
    } catch (error) {
        if (error instanceof AdicionalApiError) {
            const errors = getServerErrors(error.payload);
            return {
                status: "error",
                message: Object.keys(errors).length > 0 ? undefined : error.message,
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

    if (!id) redirect("/adicionales?error=1");

    try {
        await cambiarEstadoAdicional(id, activo);
    } catch {
        redirect(`/adicionales?complejo=${encodeURIComponent(complexId)}&error=1`);
    }

    revalidatePath("/adicionales");
    redirect(`/adicionales?complejo=${encodeURIComponent(complexId)}&estado=1`);
}

export async function eliminarAdicional(formData: FormData) {
    const id = String(formData.get("id") ?? "").trim();
    const complexId = String(formData.get("complejo") ?? "").trim();

    if (!id) redirect("/adicionales?error=1");

    try {
        await eliminarAdicionalData(id);
    } catch {
        redirect(`/adicionales?complejo=${encodeURIComponent(complexId)}&error=1`);
    }

    revalidatePath("/adicionales");
    redirect(`/adicionales?complejo=${encodeURIComponent(complexId)}&eliminado=1`);
}
