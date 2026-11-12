"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Save, Upload, X } from "lucide-react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { guardarAdicional } from "./actions";
import {
    IMAGEN_MAX_BYTES,
    type AdicionalFormState,
} from "./schemas/adicional.schema";

const INITIAL_STATE: AdicionalFormState = { status: "idle", errors: {} };
const MAX_FILE_SIZE_LABEL = `${IMAGEN_MAX_BYTES / (1024 * 1024)} MB`;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type AdicionalFormProps = {
    complejoId: string;
    complejoNombre: string;
    adicionalId?: string;
    initialValues?: {
        nombre: string;
        descripcion: string | null;
        precio: number;
    };
    initialImage?: string | null;
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

export function AdicionalForm({
    complejoId,
    complejoNombre,
    adicionalId,
    initialValues,
    initialImage,
}: AdicionalFormProps) {
    const [state, formAction, pending] = useActionState(guardarAdicional, INITIAL_STATE);
    const [imagenUrl, setImagenUrl] = useState<string | null>(initialImage ?? null);
    const [imagenError, setImagenError] = useState("");
    const errors = state.errors;
    const isEditing = Boolean(adicionalId);
    const volverHref = `/adicionales?complejo=${encodeURIComponent(complejoId)}`;

    function handleImagenUpload(result: CloudinaryUploadWidgetResults) {
        setImagenError("");
        const info = result.info;
        if (!info || typeof info === "string" || !info.secure_url) {
            setImagenError("No se pudo obtener la URL pública de la imagen.");
            return;
        }
        setImagenUrl(info.secure_url);
    }

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <form
                action={formAction}
                noValidate
                className="space-y-5"
                onSubmit={(event) => {
                    if (imagenError) event.preventDefault();
                }}
            >
                <input type="hidden" name="complexId" value={complejoId} />
                {adicionalId ? <input type="hidden" name="id" value={adicionalId} /> : null}
                <input type="hidden" name="imagen" value={imagenUrl ?? ""} />

                <header className="flex flex-col gap-5 border-b border-[#dce5e0] pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                            Catálogo de adicionales
                        </p>
                        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#172c28]">
                            {isEditing ? "Editar adicional" : "Nuevo adicional"}
                        </h1>
                        <p className="mt-2 text-sm text-[#71817b]">
                            {complejoNombre}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            nativeButton={false}
                            render={<Link href={volverHref} />}
                            variant="outline"
                            className="h-10 border-[#dce5e0] bg-white px-4 text-[#526963]"
                            disabled={pending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={pending}
                            className="h-10 gap-2 bg-[#174f40] px-5 text-white hover:bg-[#123f33] cursor-pointer"
                        >
                            <Save aria-hidden="true" className="size-4" />
                            {pending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear adicional"}
                        </Button>
                    </div>
                </header>

                <Card className="rounded-xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                    <CardContent className="space-y-6 p-6">
                        <div>
                            <h2 className="text-base font-medium text-[#172c28]">Imagen del adicional</h2>
                            <p id="imagen-help" className="mt-1 text-xs text-[#71817b]">
                                PNG o JPG, máximo {MAX_FILE_SIZE_LABEL}.
                            </p>

                            <div className="mt-4 flex flex-col gap-3">
                                <div className="relative aspect-16/8 w-full overflow-hidden rounded-xl bg-[#e8eeea] sm:w-64">
                                    {imagenUrl ? (
                                        <Image
                                            src={imagenUrl}
                                            alt="Vista previa de la imagen del adicional"
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
                                            onSuccess={handleImagenUpload}
                                            onError={() => setImagenError("No se pudo subir la imagen. Intentá nuevamente.")}
                                            options={{
                                                maxFiles: 1,
                                                multiple: false,
                                                folder: "hostflow/adicionales",
                                                sources: ["local", "url"],
                                                clientAllowedFormats: ["png", "jpg", "jpeg"],
                                                maxFileSize: IMAGEN_MAX_BYTES,
                                                cropping: true,
                                                croppingAspectRatio: 16 / 8,
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
                                                    {isLoading ? "Subiendo…" : imagenUrl ? "Cambiar imagen" : "Subir imagen"}
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    ) : (
                                        <p className="mt-1 text-xs text-[#a33c2f]">
                                            Error al subir la imagen.
                                        </p>
                                    )}
                                    {imagenUrl && imagenUrl !== initialImage ? (
                                        <button
                                            type="button"
                                            onClick={() => setImagenUrl(initialImage ?? null)}
                                            className="text-xs text-[#8a3c30] hover:underline"
                                        >
                                            <X aria-hidden="true" className="mr-1 inline size-3.5" />
                                            Quitar imagen
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            <FieldError id="imagen-error" message={imagenError || errors.imagen} />
                        </div>

                        <div className="border-t border-[#dce5e0]" />

                        <div>
                            <label htmlFor="nombre" className="text-sm font-medium text-[#172c28]">
                                Nombre<RequiredMark />
                            </label>
                            <Input
                                id="nombre"
                                name="nombre"
                                required
                                maxLength={80}
                                placeholder="Ej: Desayuno en el muelle"
                                defaultValue={initialValues?.nombre ?? ""}
                                aria-invalid={Boolean(errors.nombre)}
                                aria-describedby={errors.nombre ? "nombre-error" : undefined}
                                className="mt-1 h-10 bg-white"
                            />
                            <FieldError id="nombre-error" message={errors.nombre} />
                        </div>

                        <div>
                            <label htmlFor="descripcion" className="text-sm font-medium text-[#172c28]">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                rows={4}
                                maxLength={250}
                                placeholder="Contá qué incluye el adicional."
                                defaultValue={initialValues?.descripcion ?? ""}
                                aria-invalid={Boolean(errors.descripcion)}
                                aria-describedby={errors.descripcion ? "descripcion-error" : undefined}
                                className="mt-1 w-full resize-y rounded-lg border border-[#dce5e0] bg-white px-3 py-2 text-sm text-[#172c28] outline-none placeholder:text-[#899791] focus:border-[#28745b] focus:ring-2 focus:ring-[#28745b]/20 aria-invalid:border-[#a33c2f]"
                            />
                            <FieldError id="descripcion-error" message={errors.descripcion} />
                        </div>

                        <div className="max-w-xs">
                            <label htmlFor="precio" className="text-sm font-medium text-[#172c28]">
                                Precio (ARS)<RequiredMark />
                            </label>
                            <Input
                                id="precio"
                                name="precio"
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputMode="decimal"
                                required
                                placeholder="15000"
                                defaultValue={initialValues ? String(initialValues.precio) : ""}
                                aria-invalid={Boolean(errors.precio)}
                                aria-describedby={errors.precio ? "precio-error" : undefined}
                                className="mt-1 h-10 bg-white"
                            />
                            <FieldError id="precio-error" message={errors.precio} />
                        </div>
                    </CardContent>
                </Card>

                {errors.form ? (
                    <div className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-4 text-sm text-[#8a3c30]" role="alert">
                        {errors.form}
                    </div>
                ) : null}
                {state.message ? (
                    <div className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-4 text-sm text-[#8a3c30]" role="alert">
                        {state.message}
                    </div>
                ) : null}
            </form>
        </section>
    );
}
