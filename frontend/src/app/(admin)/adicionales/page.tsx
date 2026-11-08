import Image from "next/image";
import Link from "next/link";
import {
    CircleCheck,
    PackageOpen,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ComplejoSelector } from "@/components/complejo-selector";
import { getOwnedComplejos } from "../complejos/data/complejos.data";
import { actualizarEstadoAdicional, eliminarAdicional } from "./actions";
import { formatearPrecio, listarAdicionales, type Adicional } from "./data/adicionales.data";

type SearchParams = Promise<{
    complejo?: string | string[];
    creado?: string;
    guardado?: string;
    estado?: string;
    eliminado?: string;
    error?: string;
}>;

export const instant = false;

function getImagen(adicional: Adicional) {
    return adicional.imagen
        ?? `https://picsum.photos/seed/${encodeURIComponent(adicional.id)}/800/450`;
}

function AdicionalCard({
    adicional,
    complejoId,
    puedeEliminar,
}: {
    adicional: Adicional;
    complejoId: string;
    puedeEliminar: boolean;
}) {
    const editarHref = `/adicionales/${encodeURIComponent(adicional.id)}/editar?complejo=${encodeURIComponent(complejoId)}`;

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-[#dce5e0] bg-white">
            <div className="relative aspect-[16/8] w-full bg-[#e8eeea]">
                <Image
                    src={getImagen(adicional)}
                    alt={`Imagen de ${adicional.nombre}`}
                    fill
                    unoptimized
                    className="object-cover"
                />
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-4">
                    <span
                        className={`text-xs font-semibold uppercase tracking-widest ${
                            adicional.activo ? "text-[#174f40]" : "text-[#899791]"
                        }`}
                    >
                        {adicional.activo ? "Activo" : "Inactivo"}
                    </span>

                    <form action={actualizarEstadoAdicional} className="shrink-0">
                        <input type="hidden" name="id" value={adicional.id} />
                        <input type="hidden" name="complejo" value={complejoId} />
                        <input
                            type="hidden"
                            name="activo"
                            value={adicional.activo ? "false" : "true"}
                        />
                        <button
                            type="submit"
                            role="switch"
                            aria-checked={adicional.activo}
                            aria-label={`${adicional.activo ? "Desactivar" : "Activar"} ${adicional.nombre}`}
                            className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28745b] focus-visible:ring-offset-2 ${
                                adicional.activo
                                    ? "justify-end bg-[#28745b]"
                                    : "justify-start bg-[#cbd8d1]"
                            }`}
                        >
                            <span className="size-5 rounded-full bg-white shadow-sm" />
                        </button>
                    </form>
                </div>

                <h2 className="mt-5 text-xl font-medium text-[#172c28]">
                    {adicional.nombre}
                </h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[#71817b]">
                    {adicional.descripcion ?? "Sin descripción"}
                </p>

                <div className="mt-5 flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-[#172c28]">
                        {formatearPrecio(adicional.precio)}
                    </p>
                    <span className="text-xs text-[#71817b]">por estadía</span>
                </div>

                <div className="my-5 border-t border-[#e8eeea]" />

                <div className="mt-auto flex gap-2">
                    <Button
                        nativeButton={false}
                        render={<Link href={editarHref} />}
                        variant="outline"
                        className="h-10 flex-1 border-[#dce5e0] font-medium text-[#174f40] hover:bg-[#f5f8f6]"
                    >
                        <Pencil aria-hidden="true" className="size-3.5" />
                        Editar
                    </Button>

                    {puedeEliminar ? (
                        <form action={eliminarAdicional}>
                            <input type="hidden" name="id" value={adicional.id} />
                            <input type="hidden" name="complejo" value={complejoId} />
                            <Button
                                type="submit"
                                variant="outline"
                                size="icon"
                                aria-label={`Eliminar ${adicional.nombre}`}
                                className="size-10 border-[#e7c9c3] text-[#a33c2f] hover:bg-[#fff7f5]"
                            >
                                <Trash2 aria-hidden="true" className="size-4" />
                            </Button>
                        </form>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                            title="El backend todavía no permite eliminar adicionales"
                            className="size-10 border-[#e7c9c3] text-[#a33c2f]"
                        >
                            <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default async function AdicionalesPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const complejos = await getOwnedComplejos();

    if (complejos.length === 0) {
        return (
            <section className="mx-auto max-w-5xl space-y-6">
                <header className="border-b border-[#dce5e0] pb-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                        Servicios de tu complejo
                    </p>
                    <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#172c28]">
                        Adicionales
                    </h1>
                    <p className="mt-2 max-w-xl text-[#71817b]">
                        Configura opciones extra para ofrecer durante una estadía.
                    </p>
                </header>
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd8d1] bg-white px-6 py-12 text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#f4ece0] text-[#8a5a2b]">
                        <PackageOpen aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-[#172c28]">
                        Primero creá un complejo
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#71817b]">
                        Los adicionales se asocian a un complejo. Añadí uno para empezar a configurar servicios.
                    </p>
                    <Button
                        nativeButton={false}
                        render={<Link href="/complejos/nuevo" />}
                        className="mt-5 h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33]"
                    >
                        <Plus aria-hidden="true" className="size-4" />
                        Añadir complejo
                    </Button>
                </div>
            </section>
        );
    }

    const complejoParam = typeof params.complejo === "string" ? params.complejo : undefined;
    const complejoActual = complejos.find((complejo) => complejo.id === complejoParam) ?? complejos[0];

    let adicionales: Adicional[] = [];
    let errorDeCarga = false;
    try {
        adicionales = await listarAdicionales(complejoActual.id);
    } catch {
        errorDeCarga = true;
    }

    const puedeEliminar = !process.env.NEXT_PUBLIC_API_URL?.trim();

    const mensajeExito = params.creado === "1"
        ? "Adicional creado correctamente."
        : params.guardado === "1"
            ? "Cambios guardados correctamente."
            : params.estado === "1"
                ? "Estado del adicional actualizado."
                : params.eliminado === "1"
                    ? "Adicional eliminado correctamente."
                    : null;
    const mensajeError = params.error === "1"
        ? "No se pudo actualizar el adicional. Intentá nuevamente."
        : null;

    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-col gap-5 border-b border-[#dce5e0] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                        Servicios de tu complejo
                    </p>
                    <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#172c28]">
                        Adicionales
                    </h1>
                    <p className="mt-2 max-w-xl text-[#71817b]">
                        Configura opciones extra para ofrecer durante una estadía.
                    </p>
                </div>
                <Button
                    nativeButton={false}
                    render={
                        <Link
                            href={`/adicionales/nuevo?complejo=${encodeURIComponent(complejoActual.id)}`}
                        />
                    }
                    className="h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33]"
                >
                    <Plus aria-hidden="true" className="size-4" />
                    Nuevo adicional
                </Button>
            </header>

            <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-end">
                <ComplejoSelector
                    complejos={complejos.map((complejo) => ({
                        id: complejo.id,
                        nombre: complejo.nombre,
                    }))}
                    value={complejoActual.id}
                />
                <p className="text-sm text-[#71817b]" aria-live="polite">
                    {adicionales.length} {adicionales.length === 1 ? "adicional" : "adicionales"}
                </p>
            </div>

            {mensajeExito ? (
                <div className="flex items-start gap-3 rounded-lg border border-[#cfe3d8] bg-[#e8f1ec] p-4 text-sm text-[#174f40]" role="status">
                    <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {mensajeExito}
                </div>
            ) : null}
            {mensajeError ? (
                <div className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-4 text-sm text-[#8a3c30]" role="alert">
                    {mensajeError}
                </div>
            ) : null}
            {errorDeCarga ? (
                <div className="rounded-lg border border-[#e7c9c3] bg-[#fff7f5] p-4 text-sm text-[#8a3c30]" role="alert">
                    No se pudieron cargar los adicionales del complejo. Revisá la conexión con el servidor.
                </div>
            ) : null}

            {adicionales.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {adicionales.map((adicional) => (
                        <AdicionalCard
                            key={adicional.id}
                            adicional={adicional}
                            complejoId={complejoActual.id}
                            puedeEliminar={puedeEliminar}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd8d1] bg-white px-6 py-12 text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#e4eff3] text-[#1f6178]">
                        <PackageOpen aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-[#172c28]">
                        Todavía no agregaste servicios adicionales
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#71817b]">
                        Sumá tu primer adicional para ofrecerlo a los huéspedes durante la estadía.
                    </p>
                    <Button
                        nativeButton={false}
                        render={
                            <Link
                                href={`/adicionales/nuevo?complejo=${encodeURIComponent(complejoActual.id)}`}
                            />
                        }
                        className="mt-5 h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33]"
                    >
                        <Plus aria-hidden="true" className="size-4" />
                        Nuevo adicional
                    </Button>
                </div>
            )}
        </section>
    );
}
