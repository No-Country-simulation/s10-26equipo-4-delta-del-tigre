"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Save, Upload, X } from "lucide-react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    complejoFormSchema,
    LOGO_MAX_BYTES,
    type ComplejoFormValues,
} from "@/app/(admin)/complejos/schemas/complejo-form.schema";
import {
    actualizarComplejoAction,
    crearComplejoAction,
} from "./actions";

const MAX_FILE_SIZE_LABEL = `${LOGO_MAX_BYTES / (1024 * 1024)} MB`;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type ComplejoFormProps = {
    complejoId?: string;
    initialValues?: Partial<ComplejoFormValues>;
    initialSlug?: string | null;
};

function FieldError({ id, message }: { id: string; message?: string }) {
    return message ? (
        <p id={id} className="mt-1 text-sm text-[#a33c2f]" role="alert">
            {message}
        </p>
    ) : null;
}

function RequiredMark() {
    return <span aria-hidden="true" className="text-[#a33c2f]"> *</span>;
}

function validateForm(form: HTMLFormElement) {
    const validation = complejoFormSchema.safeParse(
        Object.fromEntries(new FormData(form).entries()),
    );
    const fieldErrors: Record<string, string> = {};

    if (!validation.success) {
        for (const issue of validation.error.issues) {
            const field = String(issue.path[0] ?? "");
            if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
        }
    }

    return { validation, fieldErrors };
}

function getColorValue(value?: string) {
    const firstColor = value?.split(",")[0]?.trim();
    return firstColor && /^#[\da-f]{6}$/i.test(firstColor) ? firstColor : "#174f40";
}

export function ComplejoForm({
    complejoId,
    initialValues,
    initialSlug,
}: ComplejoFormProps) {
    const router = useRouter();
    const [colorValue, setColorValue] = useState(() =>
        getColorValue(initialValues?.coloresMarca),
    );
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(
        initialValues?.logoUrl || null,
    );
    const [logoError, setLogoError] = useState("");
    const [isOpen, setIsOpen] = useState(
        initialValues?.estadoOperativo !== "cerrado",
    );
    const isEditing = Boolean(complejoId);

    function handleLogoUpload(result: CloudinaryUploadWidgetResults) {
        setLogoError("");
        const info = result.info;
        if (!info || typeof info === "string" || !info.secure_url) {
            setLogoError("No se pudo obtener la URL pública del logo.");
            return;
        }
        setLogoUrl(info.secure_url);
    }

    function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
        if (!hasAttemptedSubmit) return;
        const form = event.currentTarget.form;
        if (!form) return;

        const { fieldErrors: nextFieldErrors } = validateForm(form);
        setFieldErrors(nextFieldErrors);
        setFormErrors([]);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setHasAttemptedSubmit(true);
        setFieldErrors({});
        setFormErrors([]);
        setIsSaved(false);

        if (logoError) return;

        const { validation, fieldErrors: nextFieldErrors } = validateForm(
            event.currentTarget,
        );
        if (!validation.success) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const result = complejoId
                ? await actualizarComplejoAction(complejoId, validation.data)
                : await crearComplejoAction(validation.data);

            if (!result.ok) {
                setFieldErrors(result.fieldErrors ?? {});
                setFormErrors(
                    result.fieldErrors && Object.keys(result.fieldErrors).length > 0
                        ? []
                        : [result.message],
                );
                return;
            }

            setIsSaved(true);
            router.push(`/complejos/${encodeURIComponent(result.id)}?guardado=1`);
            router.refresh();
        } catch (error) {
            setFormErrors([
                error instanceof Error
                    ? error.message
                    : "No se pudo conectar con el servidor. Intentá nuevamente.",
            ]);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />
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
                            className="h-10 cursor-pointer border-[#dce5e0] bg-white px-4 text-[#526963]"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isSaved}
                            className="h-10 cursor-pointer gap-2 bg-[#174f40] px-5 text-white hover:bg-[#123f33]"
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

                        <div>
                            <h3 className="text-base font-medium text-[#172c28]">Logo del complejo</h3>
                            <p id="logo-help" className="mt-1 text-xs text-[#71817b]">
                                PNG o JPG, máximo {MAX_FILE_SIZE_LABEL}.
                            </p>

                            <div className="mt-4 flex flex-col gap-3">
                                <div className="relative aspect-square w-32 overflow-hidden rounded-xl bg-[#e8eeea]">
                                    {logoUrl ? (
                                        <Image
                                            src={logoUrl}
                                            alt="Vista previa del logo del complejo"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-[#899791]">
                                            <ImagePlus aria-hidden="true" className="size-7" />
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-start gap-2">
                                    {CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET ? (
                                        <CldUploadWidget
                                            uploadPreset={CLOUDINARY_UPLOAD_PRESET}
                                            onSuccess={handleLogoUpload}
                                            onError={() => setLogoError("No se pudo subir el logo. Intentá nuevamente.")}
                                            options={{
                                                maxFiles: 1,
                                                multiple: false,
                                                folder: "hostflow/logos",
                                                sources: ["local", "url"],
                                                clientAllowedFormats: ["png", "jpg", "jpeg"],
                                                maxFileSize: LOGO_MAX_BYTES,
                                                cropping: true,
                                                croppingAspectRatio: 1,
                                                language: "es",
                                            }}
                                        >
                                            {({ open, isLoading }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => open()}
                                                    disabled={isLoading}
                                                    className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#174f40] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <Upload aria-hidden="true" className="size-3.5" />
                                                    {isLoading ? "Subiendo…" : logoUrl ? "Cambiar logo" : "Subir logo"}
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    ) : (
                                        <p className="mt-1 text-xs text-[#a33c2f]">
                                            Error al subir el logo.
                                        </p>
                                    )}
                                    {logoUrl && logoUrl !== initialValues?.logoUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => setLogoUrl(initialValues?.logoUrl || null)}
                                            className="text-xs text-[#8a3c30] hover:underline"
                                        >
                                            <X aria-hidden="true" className="mr-1 inline size-3.5" />
                                            Quitar logo
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            <FieldError id="logoUrl-error" message={logoError || fieldErrors.logoUrl} />
                        </div>

                        <div className="my-5 border-t border-[#dce5e0]" />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="nombre" className="text-sm font-medium text-[#172c28]">
                                    Nombre del complejo<RequiredMark />
                                </label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    required
                                    maxLength={150}
                                    defaultValue={initialValues?.nombre ?? ""}
                                    onChange={handleFieldChange}
                                    aria-invalid={Boolean(fieldErrors.nombre)}
                                    aria-describedby={fieldErrors.nombre ? "nombre-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="nombre-error" message={fieldErrors.nombre} />
                            </div>
                            <div>
                                <label htmlFor="direccion" className="text-sm font-medium text-[#172c28]">
                                    Dirección<RequiredMark />
                                </label>
                                <Input
                                    id="direccion"
                                    name="direccion"
                                    required
                                    maxLength={255}
                                    defaultValue={initialValues?.direccion ?? ""}
                                    onChange={handleFieldChange}
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
                                        onChange={(event) => {
                                            setColorValue(event.currentTarget.value);
                                            handleFieldChange(event);
                                        }}
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
                        <h2 className="text-base font-medium text-[#172c28]">Enlace de onboarding</h2>
                        <p className="mt-1 text-xs text-[#71817b]">
                            {isEditing && initialSlug
                                ? "El link público usa el slug generado automáticamente. No se puede modificar."
                                : "El slug se genera automáticamente a partir del nombre del complejo."}
                        </p>
                        <div className="mt-4 rounded-lg border border-[#dce5e0] bg-[#f9faf9] px-4 py-3 text-sm text-[#526963]">
                            {isEditing && initialSlug ? (
                                <span className="font-mono text-[#172c28]">{initialSlug}</span>
                            ) : (
                                <span className="text-[#899791]">Se generará al guardar el complejo.</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                    <CardContent className="p-6">
                        <h2 className="text-base font-medium text-[#172c28]">Datos de pago</h2>
                        <p className="mt-1 text-xs text-[#71817b]">
                            Opcional. Si completás un campo, completá los tres. Se muestran al finalizar el onboarding.
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="titularCuenta" className="text-sm font-medium text-[#526963]">
                                    Titular de la cuenta
                                </label>
                                <Input
                                    id="titularCuenta"
                                    name="titularCuenta"
                                    maxLength={150}
                                    autoComplete="off"
                                    defaultValue={initialValues?.titularCuenta ?? ""}
                                    onChange={handleFieldChange}
                                    aria-invalid={Boolean(fieldErrors.titularCuenta)}
                                    aria-describedby={fieldErrors.titularCuenta ? "titularCuenta-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="titularCuenta-error" message={fieldErrors.titularCuenta} />
                            </div>
                            <div>
                                <label htmlFor="aliasCbu" className="text-sm font-medium text-[#526963]">
                                    Alias o CBU
                                </label>
                                <Input
                                    id="aliasCbu"
                                    name="aliasCbu"
                                    maxLength={22}
                                    autoComplete="off"
                                    placeholder="alias.o.cbu"
                                    defaultValue={initialValues?.aliasCbu ?? ""}
                                    onChange={handleFieldChange}
                                    aria-invalid={Boolean(fieldErrors.aliasCbu)}
                                    aria-describedby={fieldErrors.aliasCbu ? "aliasCbu-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="aliasCbu-error" message={fieldErrors.aliasCbu} />
                            </div>
                            <div>
                                <label htmlFor="banco" className="text-sm font-medium text-[#526963]">
                                    Banco
                                </label>
                                <Input
                                    id="banco"
                                    name="banco"
                                    maxLength={80}
                                    autoComplete="off"
                                    defaultValue={initialValues?.banco ?? ""}
                                    onChange={handleFieldChange}
                                    aria-invalid={Boolean(fieldErrors.banco)}
                                    aria-describedby={fieldErrors.banco ? "banco-error" : undefined}
                                    className="mt-1 h-10 bg-white"
                                />
                                <FieldError id="banco-error" message={fieldErrors.banco} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-4 rounded-xl bg-[#eef4f1] px-4 py-3.5">
                    <div>
                        <p className="text-sm font-semibold text-[#172c28]">
                            Complejo {isOpen ? "abierto" : "cerrado"}<RequiredMark />
                        </p>
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
                        aria-required="true"
                        aria-label="Complejo abierto"
                        onClick={() => setIsOpen((open) => !open)}
                        className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28745b] focus-visible:ring-offset-2 ${isOpen ? "justify-end bg-[#28745b]" : "justify-start bg-[#a7b3ae]"
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
