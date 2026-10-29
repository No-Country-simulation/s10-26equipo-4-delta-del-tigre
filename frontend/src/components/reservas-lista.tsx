import Link from "next/link";
import { CalendarXIcon, ChevronRightIcon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    formatFecha,
    formatTotal,
    getReservas,
    iniciales,
    type FiltrosReservas,
} from "../lib/reservas";
import { EstadoBadge } from "./estado-badge";

const COLUMNAS = ["Huésped", "Complejo", "Check-in", "Check-out", "Huéspedes", "Total", "Estado"];

function NoDisponible() {
    return (
        <span className="text-[#a7b3ae]" aria-label="No disponible">
            —
        </span>
    );
}

function Encabezado() {
    return (
        <TableHeader className="bg-[#f9faf9]">
            <TableRow className="border-y border-[#dce5e0] hover:bg-transparent">
                {COLUMNAS.map((col, i) => (
                    <TableHead
                        key={col}
                        className={`h-12 text-xs font-semibold uppercase tracking-wider text-[#71817b] ${
                            i === 0 ? "pl-6" : ""
                        }`}
                    >
                        {col}
                    </TableHead>
                ))}
                <TableHead className="w-16">
                    <span className="sr-only">Acciones</span>
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}

/* ------------------------------ Datos ------------------------------ */

export async function ReservasLista(filtros: FiltrosReservas) {
    // Si falla, el error lo captura app/.../reservas/error.tsx
    const reservas = await getReservas(filtros);
    const hayFiltros = Boolean(filtros.q || filtros.estado);

    if (reservas.length === 0) {
        return <ListaVacia hayFiltros={hayFiltros} />;
    }

    return (
        <Table>
            <Encabezado />
            <TableBody>
                {reservas.map((r) => (
                    <TableRow key={r.id} className="border-[#e8eeea] hover:bg-[#f9faf9]">
                        <TableCell className="py-4 pl-6">
                            <Link
                                href={`/reservas/${r.id}`}
                                className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#28745b]"
                            >
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f4ece0] text-xs font-semibold text-[#8a5a2b]">
                                    {iniciales(r.huesped)}
                                </span>
                                <span className="font-semibold text-[#172c28] hover:underline">
                                    {r.huesped}
                                </span>
                            </Link>
                        </TableCell>
                        <TableCell className="text-[#4f5f59]">
                            {r.complejo ?? <NoDisponible />}
                        </TableCell>
                        <TableCell className="text-[#4f5f59]">{formatFecha(r.checkIn)}</TableCell>
                        <TableCell className="text-[#4f5f59]">{formatFecha(r.checkOut)}</TableCell>
                        <TableCell className="text-[#4f5f59]">
                            {r.personas} {r.personas === 1 ? "persona" : "personas"}
                        </TableCell>
                        <TableCell className="text-[#4f5f59]">
                            {r.total != null ? formatTotal(r.total) : <NoDisponible />}
                        </TableCell>
                        <TableCell>
                            <EstadoBadge estado={r.estado} />
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                            <Button
                                variant="outline"
                                size="icon"
                                nativeButton={false}
                                render={<Link href={`/reservas/${r.id}`} />}
                                aria-label={`Ver detalle de la reserva de ${r.huesped}`}
                                className="size-9 rounded-lg border-[#dce5e0] text-[#4f5f59]"
                            >
                                <ChevronRightIcon className="size-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

/* ----------------------------- Vacío ----------------------------- */

function ListaVacia({ hayFiltros }: { hayFiltros: boolean }) {
    const Icono = hayFiltros ? SearchXIcon : CalendarXIcon;

    return (
        <div className="flex flex-col items-center gap-3 border-t border-[#dce5e0] px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f4ece0] text-[#8a5a2b]">
                <Icono className="size-5" />
            </span>
            <div>
                <p className="font-medium text-[#172c28]">
                    {hayFiltros ? "No encontramos reservas con esos filtros" : "Todavía no hay reservas"}
                </p>
                <p className="mt-1 text-sm text-[#71817b]">
                    {hayFiltros
                        ? "Probá con otro nombre o quitá el filtro de estado."
                        : "Cuando cargues la primera reserva, va a aparecer acá."}
                </p>
            </div>
            {hayFiltros ? (
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/reservas" />}
                    className="rounded-xl"
                >
                    Limpiar filtros
                </Button>
            ) : (
                <Button
                    nativeButton={false}
                    render={<Link href="/reservas/nueva" />}
                    className="rounded-xl bg-[#174f40] text-white hover:bg-[#123f33]"
                >
                    Nueva reserva
                </Button>
            )}
        </div>
    );
}

/* ---------------------------- Carga ---------------------------- */

export function ReservasListaSkeleton() {
    return (
        <div role="status" aria-label="Cargando reservas">
            <Table>
                <Encabezado />
                <TableBody>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i} className="border-[#e8eeea] hover:bg-transparent">
                            <TableCell className="py-4 pl-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="size-10 rounded-xl" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            </TableCell>
                            {Array.from({ length: 5 }).map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                            ))}
                            <TableCell>
                                <Skeleton className="h-7 w-24 rounded-lg" />
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                                <Skeleton className="ml-auto size-9 rounded-lg" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
