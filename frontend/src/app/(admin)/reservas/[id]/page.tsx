import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { formatFecha, formatTotal, getReservaById, iniciales } from "@/lib/reservas";
import { VolverButton } from "@/components/volver-button";
import { EstadoBadge } from "@/components/estado-badge";

type Params = Promise<{ id: string }>;

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <dt className="text-sm text-[#71817b]">{label}</dt>
            <dd className="mt-1 font-medium text-[#172c28]">
                {children ?? <span className="text-[#a7b3ae]">No disponible</span>}
            </dd>
        </div>
    );
}

export default async function ReservaDetallePage({ params }: { params: Params }) {
    const { id } = await params;
    const reserva = await getReservaById(id);

    if (!reserva) notFound();

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <VolverButton />

            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f4ece0] text-lg font-semibold text-[#8a5a2b]">
                        {iniciales(reserva.huesped)}
                    </span>
                    <div>
                        <h1 className="text-3xl font-medium tracking-tight text-[#172c28]">
                            {reserva.huesped}
                        </h1>
                        <p className="mt-1 text-sm text-[#71817b]">Reserva {reserva.id}</p>
                    </div>
                </div>
                <EstadoBadge estado={reserva.estado} />
            </header>

            <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                <CardContent className="p-6">
                    <h2 className="text-lg font-medium text-[#172c28]">Detalle de la estadía</h2>
                    <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                        <Dato label="Complejo">{reserva.complejo ?? null}</Dato>
                        <Dato label="Huéspedes">
                            {reserva.personas} {reserva.personas === 1 ? "persona" : "personas"}
                        </Dato>
                        <Dato label="Check-in">{formatFecha(reserva.checkIn, true)}</Dato>
                        <Dato label="Check-out">{formatFecha(reserva.checkOut, true)}</Dato>
                        <Dato label="Total">
                            {reserva.total != null ? formatTotal(reserva.total) : null}
                        </Dato>
                    </dl>
                </CardContent>
            </Card>
        </section>
    );
}
