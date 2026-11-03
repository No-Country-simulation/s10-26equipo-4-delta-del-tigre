"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Save, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    complejoFormSchema,
    LOGO_ACCEPTED_TYPES,
    LOGO_MAX_BYTES,
    type ComplejoFormValues,
} from "@/app/(admin)/complejos/schemas/complejo-form.schema";
import { ComplejoApiError, guardarComplejo } from "../../../services/complejos/complejos.service";

type ComplejoFormProps = {
    complejoId?: string;
    initialValues?: Partial<ComplejoFormValues>;
    initialLogo?: string | null;
};

const MAX_FILE_SIZE_LABEL = `${LOGO_MAX_BYTES / (1024 * 1024)} MB`;

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className="mt-1 text-sm text-[#a33c2f]" role="alert">
            {message}
        </p>
    ) : null;
}

function getColorValue(value?: string) {
    const firstColor = value?.split(",")[0]?.trim();
    return firstColor && /^#[\da-f]{6}$/i.test(firstColor) ? firstColor : "#174f40";
}

function getInitials(value?: string) {
    return value
        ?.trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toLocaleUpperCase("es") || "";
}

function getResponseId(payload: unknown): string | undefined {
    if (!payload || typeof payload !== "object") return undefined;
    const data = payload as Record<string, unknown>;
    const nested = data.complejo ?? data.data;
    const resource = nested && typeof nested === "object"
        ? nested as Record<string, unknown>
        : data;
    const id = resource.id ?? resource.uuid;
    return typeof id === "string" || typeof id === "number" ? String(id) : undefined;
}

function getServerErrors(payload: unknown) {
    const fieldErrors: Record<string, string> = {};
    const formErrors: string[] = [];
    if (!payload || typeof payload !== "object") return { fieldErrors, formErrors };

    const data = payload as Record<string, unknown>;
    const fieldNames: Record<string, string> = {
        nombre: "nombre",
        name: "nombre",
        direccion: "direccion",
        address: "direccion",
        estadooperativo: "estadoOperativo",
        estado_operativo: "estadoOperativo",
        slug: "slug",
        coloresmarca: "coloresMarca",
        colores_marca: "coloresMarca",
        logo: "logo",
        url_logo: "logo",
        maxpersonas: "maxPersonas",
        max_personas: "maxPersonas",
        minpersonas: "minPersonas",
        min_personas: "minPersonas",
        maxreservas: "maxReservas",
        max_reservas: "maxReservas",
        titularcuenta: "titularCuenta",
        titular_cuenta: "titularCuenta",
        aliascbu: "aliasCbu",
        alias_cbu: "aliasCbu",
        banco: "banco",
        cuenta: "cuenta",
    };
    const validation = data.errors ?? data.fieldErrors;

    if (validation && typeof validation === "object" && !Array.isArray(validation)) {
        for (const [field, rawMessages] of Object.entries(validation)) {
            const name = fieldNames[field.toLowerCase()];
            const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
            const message = messages.find((entry): entry is string => typeof entry === "string");
            if (name && message) fieldErrors[name] = message;
            else if (message) formErrors.push(message);
        }
    } else if (Array.isArray(validation)) {
        for (const entry of validation) {
            if (typeof entry === "string") formErrors.push(entry);
            else if (entry && typeof entry === "object") {
                const error = entry as Record<string, unknown>;
                const field = error.field ?? error.name;
                const message = error.message ?? error.defaultMessage ?? error.detail;
                const name = typeof field === "string" ? fieldNames[field.toLowerCase()] : undefined;
                if (typeof message === "string" && name) fieldErrors[name] = message;
                else if (typeof message === "string") formErrors.push(message);
            }
        }
    }

    for (const key of ["message", "detail", "title"]) {
        if (typeof data[key] === "string") formErrors.push(data[key] as string);
    }

    return { fieldErrors, formErrors: [...new Set(formErrors)] };
}

export function ComplejoForm({ complejoId, initialValues, initialLogo }: ComplejoFormProps) {
    const router = useRouter();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo ?? null);
    const [colorValue, setColorValue] = useState(() => getColorValue(initialValues?.coloresMarca));
    const previewUrlRef = useRef<string | null>(null);
    const [logoError, setLogoError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isOpen, setIsOpen] = useState(initialValues?.estadoOperativo !== "cerrado");
    const isEditing = Boolean(complejoId);

    useEffect(() => () => {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    }, []);

    function handleLogoChange(file: File | undefined) {
        setLogoError("");
        if (!file) return;

        if (!LOGO_ACCEPTED_TYPES.includes(file.type as typeof LOGO_ACCEPTED_TYPES[number])) {
            setLogoError("El logo debe ser una imagen PNG o JPG.");
            return;
        }
        if (file.size > LOGO_MAX_BYTES) {
            setLogoError(`El logo no puede superar ${MAX_FILE_SIZE_LABEL}.`);
            return;
        }
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = URL.createObjectURL(file);
        setLogoFile(file);
        setLogoPreview(previewUrlRef.current);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFieldErrors({});
        setFormErrors([]);
        setLogoError("");
        setIsSaved(false);

        const formData = new FormData(event.currentTarget);
        const validation = complejoFormSchema.safeParse(Object.fromEntries(formData.entries()));
        if (!validation.success) {
            const nextFieldErrors: Record<string, string> = {};
            for (const issue of validation.error.issues) {
                const field = String(issue.path[0] ?? "");
                if (field && !nextFieldErrors[field]) nextFieldErrors[field] = issue.message;
            }
            setFieldErrors(nextFieldErrors);
            return;
        }

        const payload = new FormData();
        for (const [field, value] of Object.entries(validation.data)) {
            payload.append(field, value == null ? "" : String(value));
        }
        if (logoFile) payload.append("logo", logoFile);

        setIsSubmitting(true);
        try {
            const response = await guardarComplejo(complejoId, payload);
            const responseId = getResponseId(response);
            setIsSaved(true);
            window.setTimeout(() => {
                if (isEditing && complejoId) {
                    router.push(`/complejos/${encodeURIComponent(complejoId)}?guardado=1`);
                } else if (responseId) {
                    router.push(`/complejos/${encodeURIComponent(responseId)}`);
                } else {
                    router.push("/complejos?creado=1");
                }
                router.refresh();
            }, 700);
        } catch (error) {
            if (error instanceof ComplejoApiError) {
                const parsed = getServerErrors(error.payload);
                setFieldErrors(parsed.fieldErrors);
                setFormErrors(
                    parsed.formErrors.length > 0
                        ? parsed.formErrors
                        : Object.keys(parsed.fieldErrors).length > 0
                            ? []
                            : [error.message],
                );
            } else {
                setFormErrors([
                    error instanceof Error
                        ? error.message
                        : "No se pudo conectar con el servidor. Intentá nuevamente.",
                ]);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <header className="flex flex-col gap-5 border-b border-[#dce5e0] pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                            Configuración
                        </p>
                        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#172c28]">
                            {isEditing ? "Mi complejo" : "Nuevo complejo"}
                        </h1>
                        <p className="mt-2 text-sm text-[#71817b]">
                            Personalizá la experiencia que verán tus huéspedes.
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            nativeButton={false}
                            render={<Link href={isEditing && complejoId ? `/complejos/${complejoId}` : "/complejos"} />}
                            variant="outline"
                            className="h-10 border-[#dce5e0] bg-white px-4 text-[#526963]"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isSaved}
                            className="h-10 gap-2 bg-[#174f40] px-5 text-white hover:bg-[#123f33]"
                        >
                            <Save aria-hidden="true" className="size-4" />
                            {isSubmitting ? "Guardando…" : isSaved ? "Guardado" : "Guardar cambios"}
                        </Button>
                    </div>
                </header>

                <Card className="rounded-xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                    <CardContent className="p-6">
                        <h2 className="text-base font-medium text-[#172c28]">Identidad del complejo</h2>
                        <p className="mt-1 text-xs text-[#71817b]">Estos datos aparecen en tu ficha de onboarding.</p>
                        <div className="my-5 border-t border-[#dce5e0]" />

                        <div className="flex items-center gap-3">
                            <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#174f40] text-xs font-semibold text-white">
                                {logoPreview ? (
                                    <Image src={logoPreview} alt="Vista previa del logo" fill unoptimized className="object-cover" />
                                ) : (
                                    getInitials(initialValues?.nombre) || <ImagePlus aria-hidden="true" className="size-5" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#172c28]">Logo del complejo</p>
                                <p id="logo-help" className="mt-0.5 text-xs text-[#71817b]">
                                    PNG o JPG, máximo {MAX_FILE_SIZE_LABEL}.
                                </p>
                                <label
                                    htmlFor="logo"
                                    className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#174f40] hover:underline"
                                >
                                    <Upload aria-hidden="true" className="size-3.5" />
                                    {logoPreview ? "Cambiar logo" : "Subir nuevo logo"}
                                </label>
                                <input
                                    id="logo"
                                    name="logoFile"
                                    type="file"
                                    accept={LOGO_ACCEPTED_TYPES.join(",")}
                                    className="sr-only"
                                    aria-describedby="logo-help logo-error"
                                    onChange={(event) => handleLogoChange(event.currentTarget.files?.[0])}
                                />
                                {logoFile ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                                            previewUrlRef.current = null;
                                            setLogoFile(null);
                                            setLogoPreview(initialLogo ?? null);
                                        }}
                                        className="ml-3 text-xs text-[#8a3c30] hover:underline"
                                    >
                                        <X aria-hidden="true" className="mr-1 inline size-3.5" />
                                        Quitar selección
                                    </button>
                                ) : null}
                            </div>
                        </div>
                        <FieldError id="logo-error" message={logoError || fieldErrors.logo} />

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="nombre" className="text-sm font-medium text-[#172c28]">
                                    Nombre del complejo <span aria-hidden="true" className="text-[#a33c2f]">*</span>
                                </label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    required
                                    maxLength={100}
                                    defaultValue={initialValues?.nombre ?? ""}
                                    aria-invalid={Boolean(fieldErrors.nombre)}
                                    aria-describedby={fieldErrors.nombre ? "nombre-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="nombre-error" message={fieldErrors.nombre} />
                            </div>
                            <div>
                                <label htmlFor="direccion" className="text-sm font-medium text-[#172c28]">
                                    Dirección <span aria-hidden="true" className="text-[#a33c2f]">*</span>
                                </label>
                                <Input
                                    id="direccion"
                                    name="direccion"
                                    required
                                    maxLength={200}
                                    defaultValue={initialValues?.direccion ?? ""}
                                    aria-invalid={Boolean(fieldErrors.direccion)}
                                    aria-describedby={fieldErrors.direccion ? "direccion-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="direccion-error" message={fieldErrors.direccion} />
                            </div>
                            <div>
                                <label htmlFor="coloresMarca" className="text-sm font-medium text-[#172c28]">Color de marca</label>
                                <div className="mt-1 flex h-10 items-center gap-3 rounded-lg border border-[#dce5e0] bg-white px-2.5">
                                    <input
                                        id="coloresMarca"
                                        name="coloresMarca"
                                        type="color"
                                        value={colorValue}
                                        aria-label="Seleccionar color de marca"
                                        aria-invalid={Boolean(fieldErrors.coloresMarca)}
                                        onChange={(event) => setColorValue(event.currentTarget.value)}
                                        className="size-8 cursor-pointer border-0 bg-transparent p-0"
                                    />
                                    <span className="text-xs text-[#172c28]">{colorValue.toUpperCase()}</span>
                                </div>
                                <FieldError id="color-error" message={fieldErrors.coloresMarca} />
                            </div>
                        </div>
                    </CardContent>
                </Card>



                <Card className="rounded-xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                    <CardContent className="p-6">
                        <h2 className="text-base font-medium text-[#172c28]">Datos del alojamiento</h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="slug" className="text-sm font-medium text-[#526963]">Slug</label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    maxLength={80}
                                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                    placeholder="mi-complejo"
                                    defaultValue={initialValues?.slug ?? ""}
                                    aria-invalid={Boolean(fieldErrors.slug)}
                                    aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="slug-error" message={fieldErrors.slug} />
                            </div>
                            {(["minPersonas", "maxPersonas", "maxReservas"] as const).map((name) => {
                                const labels = {
                                    minPersonas: "Capacidad mínima",
                                    maxPersonas: "Capacidad máxima",
                                    maxReservas: "Máximo de reservas",
                                };
                                return (
                                    <div key={name}>
                                        <label htmlFor={name} className="text-sm font-medium text-[#526963]">{labels[name]}</label>
                                        <Input
                                            id={name}
                                            name={name}
                                            type="number"
                                            min={1}
                                            step={1}
                                            inputMode="numeric"
                                            defaultValue={initialValues?.[name] ?? ""}
                                            aria-invalid={Boolean(fieldErrors[name])}
                                            aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
                                            className="mt-1 h-10 bg-white"
                                        />
                                        <FieldError id={`${name}-error`} message={fieldErrors[name]} />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-[#eef4f1] px-4 py-3.5">
                    <div>
                        <p className="text-sm font-semibold text-[#172c28]">Complejo {isOpen ? "abierto" : "cerrado"}</p>
                        <p className="mt-0.5 text-xs text-[#71817b]">
                            {isOpen
                                ? "Los huéspedes pueden completar nuevos onboardings."
                                : "Los huéspedes no pueden iniciar nuevos onboardings."}
                        </p>
                    </div>
                    <input type="hidden" name="estadoOperativo" value={isOpen ? "abierto" : "cerrado"} />
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isOpen}
                        aria-label="Complejo abierto"
                        onClick={() => setIsOpen((open) => !open)}
                        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28745b] focus-visible:ring-offset-2 ${
                            isOpen ? "justify-end bg-[#28745b]" : "justify-start bg-[#a7b3ae]"
                        }`}
                    >
                        <span className="size-4 rounded-full bg-white shadow-sm" />
                    </button>
                </div>
                <FieldError id="estadoOperativo-error" message={fieldErrors.estadoOperativo} />


                {formErrors.length > 0 ? (
                    <div className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-4 text-sm text-[#8a3c30]" role="alert">
                        {formErrors.map((message) => <p key={message}>{message}</p>)}
                    </div>
                ) : null}
                {isSaved ? (
                    <p className="rounded-lg border border-[#cfe3d8] bg-[#e8f1ec] p-4 text-sm text-[#174f40]" role="status">
                        Guardado confirmado. Redirigiendo…
                    </p>
                ) : null}

            </form>
        </section>
    );
}
