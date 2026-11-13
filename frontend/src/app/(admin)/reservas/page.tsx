import { Suspense } from "react";
import { CheckIcon, ClockIcon, UsersIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ReservasFiltros } from "@/components/reservas-filtros";
import { ReservasLista, ReservasListaSkeleton } from "@/components/reservas-lista";
import { esEstadoValido } from "@/lib/reservas";
import { getResumen } from "./data/reservas.data";


type SearchParams = Promise<{ q?: string; estado?: string }>;

export default async function ReservasWrapperPage({ searchParams }: { searchParams: SearchParams }) {


    return (
        <Suspense fallback={<p>Cargando reservas...</p>}>
            <ReservasPage searchParams={searchParams} />
        </Suspense>
    );
}


async function ReservasPage({ searchParams }: { searchParams: SearchParams }) {
    const { q, estado } = await searchParams;
    const estadoValido = esEstadoValido(estado) ? estado : undefined;
    const resumen = await getResumen();

    const stats = [
        {
            label: "Pendientes",
            value: String(resumen.pendientes).padStart(2, "0"),
            hint: "Requieren atención",
            icon: ClockIcon,
            iconBox: "bg-[#f4ece0] text-[#8a5a2b]",
            hintClass: "text-[#71817b]",
        },
        {
            label: "Próximos ingresos",
            value: String(resumen.proximosIngresos),
            hint: "En los próximos 7 días",
            icon: UsersIcon,
            iconBox: "bg-[#e4eff3] text-[#1f6178]",
            hintClass: "text-[#71817b]",
        },
        {
            label: "Confirmadas",
            value: String(resumen.confirmadas),
            hint: "Reservas confirmadas",
            icon: CheckIcon,
            iconBox: "bg-[#e3eee9] text-[#174f40]",
            hintClass: "text-[#28745b]",
        },
    ];

    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#28745b]">
                        Gestión de estadías
                    </p>
                    <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#172c28]">
                        Reservas
                    </h1>
                    <p className="mt-2 text-[#71817b]">
                        Seguí los próximos arribos y el estado de cada huésped.
                    </p>
                </div>


            </header>

            <div className="grid gap-5 md:grid-cols-3">
                {stats.map(({ label, value, hint, icon: Icon, iconBox, hintClass }) => (
                    <Card
                        key={label}
                        className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0"
                    >
                        <CardContent className="flex items-center gap-4 p-6">
                            <div
                                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${iconBox}`}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-sm text-[#71817b]">{label}</p>
                                <p className="text-3xl font-bold leading-tight text-[#172c28]">
                                    {value}
                                </p>
                                <p className={`text-xs ${hintClass}`}>{hint}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="overflow-hidden rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                <div className="flex flex-col flex-wrap items-start justify-between gap-4 p-6">
                    <div className="flex gap-6">
                        <h2 className="text-lg font-medium text-[#172c28]">Próximas reservas</h2>
                        <p className="mt-1 text-sm text-[#71817b]">Ordenadas por fecha de llegada</p>
                    </div>
                    <Suspense fallback={<div>Cargando filtros...</div>}>
                        <ReservasFiltros />
                    </Suspense>
                </div>

                {/* La key fuerza el fallback de carga cuando cambian los filtros */}
                <Suspense key={`${q ?? ""}|${estadoValido ?? ""}`} fallback={<ReservasListaSkeleton />}>
                    <ReservasLista q={q} estado={estadoValido} />
                </Suspense>
            </Card>
        </section>
    );
}
