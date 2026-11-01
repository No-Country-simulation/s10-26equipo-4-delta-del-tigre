import Image from "next/image";
import Link from "next/link";
import {
    BrushCleaning,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    SearchX,
    Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    esEstadoComplejo,
    ESTADOS_COMPLEJO,
    getEstadoComplejo,
    getOwnedComplejos,
    tieneEstadoComplejo,
    type Complejo,
    type EstadoComplejo,
} from "./complejos.data";

const ESTADO_BADGE_STYLES: Record<EstadoComplejo, string> = {
    "sin-configurar": "border-[#dce5e0] bg-[#f5f8f6] text-[#526963]",
    "faltan-datos": "border-[#eed9ab] bg-[#fbf2dd] text-[#805d1e]",
    completado: "border-[#cfe3d8] bg-[#e8f1ec] text-[#174f40]",
    "sin-publicar": "border-[#eed9ab] bg-[#fbf2dd] text-[#805d1e]",
    abierto: "border-[#cfe3d8] bg-[#e8f1ec] text-[#174f40]",
    cerrado: "border-[#dce5e0] bg-[#eef1ef] text-[#526963]",
};

function EstadoBadge({ complejo }: { complejo: Complejo }) {
    const estado = getEstadoComplejo(complejo);
    const label = ESTADOS_COMPLEJO.find((opcion) => opcion.value === estado)?.label;

    return (
        <Badge variant="outline" className={ESTADO_BADGE_STYLES[estado]}>
            {label}
        </Badge>
    );
}

export const instant = false

export default async function ComplejosPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string | string[]; estado?: string | string[] }>;
}) {
    const { q, estado } = await searchParams;
    const query = typeof q === "string" ? q.trim().toLocaleLowerCase("es") : "";
    const estadoActual = typeof estado === "string" && esEstadoComplejo(estado)
        ? estado
        : undefined;
    const hayFiltros = Boolean(query || estadoActual);
    const ownedComplejos = getOwnedComplejos();
    const filteredComplejos = ownedComplejos.filter((complejo) => {
        const coincideBusqueda = `${complejo.nombre} ${complejo.direccion} ${complejo.slug ?? ""}`
            .toLocaleLowerCase("es")
            .includes(query);
        const coincideEstado = !estadoActual || tieneEstadoComplejo(complejo, estadoActual);
        return coincideBusqueda && coincideEstado;
    });

    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-col gap-5 border-b border-[#dce5e0] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                        Administración
                    </p>
                    <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#172c28]">
                        Complejos
                    </h1>
                    <p className="mt-2 max-w-xl text-[#71817b]">
                        Datos de los complejos vinculados a tu cuenta.
                    </p>
                </div>
                <Button
                    nativeButton={false}
                    render={<Link href="/complejos/nuevo" />}
                    className="h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33]"
                >
                    <Plus aria-hidden="true" className="size-4" />
                    Añadir complejo
                </Button>
            </header>

            <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-[#71817b]" aria-live="polite">
                    {filteredComplejos.length} {filteredComplejos.length === 1 ? "complejo" : "complejos"}
                    {hayFiltros ? " encontrados" : " registrados"}
                </p>
                <form action="/complejos" className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <div className="relative w-full sm:w-56">
                        <label className="sr-only" htmlFor="buscar-complejo">Buscar complejo</label>
                        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71817b]" />
                        <input
                            id="buscar-complejo"
                            name="q"
                            type="search"
                            defaultValue={typeof q === "string" ? q : ""}
                            placeholder="Buscar complejo"
                            className="h-10 w-full rounded-lg border border-[#dce5e0] bg-white pl-9 pr-3 text-sm text-[#172c28] outline-none placeholder:text-[#899791] focus:border-[#28745b] focus:ring-2 focus:ring-[#28745b]/20"
                        />
                    </div>
                    <label className="sr-only" htmlFor="filtrar-estado">Filtrar por estado</label>
                    <select
                        id="filtrar-estado"
                        name="estado"
                        defaultValue={estadoActual ?? ""}
                        className="h-10 w-full rounded-lg border border-[#dce5e0] bg-white px-3 text-sm text-[#172c28] outline-none focus:border-[#28745b] focus:ring-2 focus:ring-[#28745b]/20 sm:w-48"
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS_COMPLEJO.map((estadoOpcion) => (
                            <option key={estadoOpcion.value} value={estadoOpcion.value}>
                                {estadoOpcion.label}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="submit"
                        variant="outline"
                        className="h-10 gap-2 border-[#dce5e0] text-[#526963] hover:bg-[#f5f8f6]"
                    >
                        <Search aria-hidden="true" className="size-4" />
                        Filtrar
                    </Button>
                </form>
            </div>

            {filteredComplejos.length ? (
                <div className="overflow-hidden rounded-xl border border-[#dce5e0] bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-3xl border-collapse text-left text-sm">
                            <caption className="sr-only">Complejos asociados a tu cuenta</caption>
                            <thead className="bg-[#f9faf9] text-xs font-semibold uppercase tracking-wider text-[#71817b]">
                                <tr className="border-b border-[#dce5e0]">
                                    <th className="h-12 px-6" scope="col">Complejo</th>
                                    <th className="h-12 px-4" scope="col">Dirección</th>
                                    <th className="h-12 px-4" scope="col">Capacidad máxima</th>
                                    <th className="h-12 px-4" scope="col">Capacidad mínima</th>
                                    <th className="h-12 px-4" scope="col">Estado</th>
                                    <th className="h-12 px-4" scope="col">Slug</th>
                                    <th className="w-16 px-4" scope="col"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComplejos.map((complejo) => (
                                    <tr key={complejo.id} className="border-b border-[#e8eeea] last:border-0 hover:bg-[#f9faf9]">
                                        <th className="py-4 pl-6 pr-4 font-medium" scope="row">
                                            <Link
                                                href={`/complejos/${complejo.id}`}
                                                className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#28745b]"
                                            >
                                                {complejo.logo ? (
                                                    <Image
                                                        src={complejo.logo}
                                                        alt={`Logo de ${complejo.nombre}`}
                                                        width={40}
                                                        height={40}
                                                        unoptimized
                                                        className="size-10 shrink-0 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f1ec] text-sm font-semibold text-[#174f40]">
                                                        {complejo.nombre.slice(0, 1).toLocaleUpperCase("es")}
                                                    </span>
                                                )}
                                                <span className="text-[#172c28] hover:underline">{complejo.nombre}</span>
                                            </Link>
                                        </th>
                                        <td className="px-4 py-4 text-[#4f5f59]">{complejo.direccion}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant="outline" className="border-[#dce5e0] bg-[#f5f8f6] text-[#526963]">
                                                {complejo.maxPersonas == null
                                                    ? "Sin definir"
                                                    : `${complejo.maxPersonas} ${complejo.maxPersonas === 1 ? "persona" : "personas"}`}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant="outline" className="border-[#dce5e0] bg-[#f5f8f6] text-[#526963]">
                                                {complejo.minPersonas == null
                                                    ? "Sin definir"
                                                    : `${complejo.minPersonas} ${complejo.minPersonas === 1 ? "persona" : "personas"}`}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <EstadoBadge complejo={complejo} />
                                        </td>
                                        <td className="px-4 py-4 text-[#4f5f59]">
                                            {complejo.slug ?? <span className="text-[#a7b3ae]">—</span>}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            aria-label={`Acciones de ${complejo.nombre}`}
                                                            className="size-9 rounded-lg border-[#dce5e0] text-[#4f5f59]"
                                                        />
                                                    }
                                                >
                                                    <MoreHorizontal aria-hidden="true" className="size-4" />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem
                                                        render={<Link href={`/complejos/${complejo.id}`} />}
                                                        className="gap-2"
                                                    >
                                                        <Eye aria-hidden="true" />
                                                        Ver detalle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled className="gap-2">
                                                        <Pencil aria-hidden="true" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        disabled
                                                        variant="destructive"
                                                        className="gap-2"
                                                    >
                                                        <Trash2 aria-hidden="true" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd8d1] bg-white px-6 py-12 text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#f4ece0] text-[#8a5a2b]">
                        <SearchX aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-4 text-lg font-semibold text-[#172c28]">
                        {hayFiltros ? "No encontramos complejos con estos filtros" : "Lo sentimos, no tienes complejos creados aún"}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#71817b]">
                        {hayFiltros
                            ? "Prueba con otros criterios o limpia los filtros."
                            : "Añade tu primer complejo para verlo aquí."}
                    </p>
                   <Button
                        nativeButton={false}
                        render={<Link href="/complejos/nuevo" />}
                        className="mt-5 h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33]"
                    >
                        <Plus aria-hidden="true" className="size-4" />
                        Añadir complejo
                    </Button>
                    {hayFiltros ? (
                        <Button nativeButton={false} render={<Link href="/complejos" />} variant="outline" className="mt-5 gap-2">
                            Limpiar búsqueda
                            <BrushCleaning aria-hidden="true" className="size-4" />
                        </Button>
                    ) : null}
                </div>
            )}
        </section>
    );
}
